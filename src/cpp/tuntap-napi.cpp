
#include "tuntap-methods.h"


[[noreturn]] static void throwErrnoError(Napi::Env env, int code) {

    napi_value error;
    napi_create_error(env, Napi::Value::From(env, uv_err_name(-code)),
                      Napi::Value::From(env, uv_strerror(-code)), &error);

    Napi::Error err(env, error);
    err.Set("errno", Napi::Value::From(env, code));
    throw err;
}


#ifdef _WIN32
// 一些变量
int th_doing = 0;
wchar_t * wintunn_path ;
WINTUN_ADAPTER_HANDLE Adapter; // 适配器
WINTUN_SESSION_HANDLE Session; // 会话
HMODULE Wintun;

// 将 char* 转换为 wchar_t*
wchar_t* charToWchar(const char* input) {
    int length = MultiByteToWideChar(CP_UTF8, 0, input, -1, NULL, 0);
    wchar_t* output = new wchar_t[length];
    MultiByteToWideChar(CP_UTF8, 0, input, -1, output, length);
    return output;
}

bool IsRunningAsAdmin() {
    BOOL isAdmin = FALSE;
    PSID adminGroup = NULL;

    // 创建管理员组 SID
    SID_IDENTIFIER_AUTHORITY NtAuthority = SECURITY_NT_AUTHORITY;
    if (AllocateAndInitializeSid(
        &NtAuthority, 2,
        SECURITY_BUILTIN_DOMAIN_RID,
        DOMAIN_ALIAS_RID_ADMINS,
        0, 0, 0, 0, 0, 0,
        &adminGroup))
    {
        // 检查当前进程是否属于管理员组
        CheckTokenMembership(NULL, adminGroup, &isAdmin);
        FreeSid(adminGroup);
    }

    return isAdmin == TRUE;
}

static Napi::Value wintunInit(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    Wintun = initAnGetWintun();
    if (!Wintun) {
        throwErrnoError(env, errno);
    }
    // 将句柄转换为整数类型并返回给 JavaScript
//     Napi::Buffer<byte> buffer = Napi::Buffer<byte>::New(env, reinterpret_cast<byte*>(Wintun), sizeof Wintun);
//     return buffer;
    return  Napi::Number::From(env,1);
};
static Napi::Value wintunSetIpv4(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (!IsRunningAsAdmin())
    {
        // 抛出异常
        Napi::Error::New(env, "not admin").ThrowAsJavaScriptException();
        return env.Null(); 
    }
    std::string name = info[0].As<Napi::String>().ToString();
    std::string ip = info[1].As<Napi::String>().ToString();
    int mask = info[2].As<Napi::Number>().Int32Value();
    Adapter = createAdapter(charToWchar(name.c_str()));
    setIpv4AddrMask(Adapter,ip.c_str(),mask);
    Session = getSession(Adapter);
    // 将句柄转换为整数类型并返回给 JavaScript
//     Napi::Buffer<byte> buffer = Napi::Buffer<byte>::New(env, reinterpret_cast<byte*>(Adapter), sizeof Adapter);
//     return buffer;
    return  Napi::Number::From(env,1);
}
// static Napi::Value wintunGetSession (const Napi::CallbackInfo& info) {
//     const Napi::Env& env = info.Env();
//     // 获取传入的Buffer对象
//     Napi::Buffer<byte> buffer = info[0].As<Napi::Buffer<byte>>();
//     WINTUN_SESSION_HANDLE Session = getSession((WINTUN_ADAPTER_HANDLE)buffer.Data());
//
//     Napi::Buffer<byte> result = Napi::Buffer<byte>::New(env, reinterpret_cast<byte*>(Session), sizeof Session);
//     return result;
// }
static Napi::Value wintunUpOn(const Napi::CallbackInfo& info) {

    const Napi::Env& env = info.Env();
    if (th_doing != 0) {
        return Napi::Boolean::New(env, false);
    }
    th_doing = 1;
//     Napi::Buffer<byte> sessionHandle = info[0].As<Napi::Buffer<byte>>();
//     WINTUN_SESSION_HANDLE session = (WINTUN_SESSION_HANDLE)sessionHandle.Data();
    Napi::HandleScope scope(env);
    // 接收函数 被子线程调用
    Napi::Function handler = info[0].As<Napi::Function>();
    Napi::ThreadSafeFunction tsfn = Napi::ThreadSafeFunction::New(
            env,
            handler,  // 传递参数，子线程需要
            "ChildThread",                  // 线程名字
            0,                              // 最大工作线程数（0表示没有限制）
            1                              // 最大队列长度（1表示立即执行）
    );
    receivePacket(Session,env,tsfn);
    return  Napi::Number::From(env,1);
}
static  Napi::Value wintunClose(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
//     Napi::Buffer<byte> adapter = info[0].As<Napi::Buffer<byte>>();
//     Napi::Buffer<byte> Session = info[1].As<Napi::Buffer<byte>>();
//     Napi::Buffer<byte> Wintun = info[2].As<Napi::Buffer<byte>>();
    th_doing = 0;
    close(Adapter,Session,Wintun);
    return  Napi::Number::From(env,1);
}
// 发送数据到网卡
static  Napi::Value wintunSend(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
//     Napi::Buffer<byte> Session = info[0].As<Napi::Buffer<byte>>();
    Napi::Buffer<byte> data = info[0].As<Napi::Buffer<byte>>();
    size_t bufferLength = data.Length();
//     WINTUN_SESSION_HANDLE session = (WINTUN_SESSION_HANDLE)Session.Data();
    BYTE *Packet = WintunAllocateSendPacket(Session, bufferLength);
    if (Packet) {
        // 将 recvBuffer 的数据复制到 Packet 中
        memcpy(Packet, data.Data(), bufferLength);
        WintunSendPacket(Session, Packet);
    }
    return  Napi::Number::From(env,1);
}
static void wintunSetPath(const Napi::CallbackInfo& info){
    const Napi::Env& env = info.Env();
    std::string path = info[0].As<Napi::String>().ToString();
    wintunn_path = charToWchar(path.c_str());
}
static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("wintunInit", Napi::Function::New(env, wintunInit));
    exports.Set("wintunSetIpv4", Napi::Function::New(env, wintunSetIpv4));
//     exports.Set("wintunGetSession", Napi::Function::New(env, wintunGetSession));
    exports.Set("wintunUpOn", Napi::Function::New(env, wintunUpOn));
    exports.Set("wintunClose", Napi::Function::New(env, wintunClose));
    exports.Set("wintunSend", Napi::Function::New(env, wintunSend));
    exports.Set("wintunSetPath", Napi::Function::New(env, wintunSetPath));

    return exports;
}

NODE_API_MODULE(tuntap2Addon, Init)
// Windows 特定代码
#else

static Napi::Value tuntapInit(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 2) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsNumber() && info[1].IsBoolean())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    char name[64];
    int result = init(info[0].As<Napi::Number>().Int32Value(),
                      info[1].As<Napi::Boolean>().Value(), name);
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::String::From(env, name);
};
static Napi::Value tuntapGetFlags(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 1) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    int flag = 0;
    std::string name = info[0].As<Napi::String>().ToString();
    int result = getFlags((char*)name.data(), &flag);
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, flag);
}
static Napi::Value tuntapSetMac(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 2) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString() && info[1].IsString())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    std::string mac = info[1].As<Napi::String>().ToString();
    int result = setMac((char*)name.data(), (char*)mac.data());
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, result);
}
static Napi::Value tuntapSetUp(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 1) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    int result = setUp((char*)name.data());
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, result);
}
static Napi::Value tuntapSetDown(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 1) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    int result = setDown((char*)name.data());
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, result);
}
static Napi::Value tuntapSetMtu(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 2) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString() && info[1].IsNumber())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    int result =
        setMtu((char*)name.data(), info[1].As<Napi::Number>().Int32Value());
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, result);
}
static Napi::Value tuntapGetMtu(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 1) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    int mtu = 0;
    int result = getMtu((char*)name.data(), &mtu);
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, mtu);
}
static Napi::Value tuntapSetIpv4(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 3) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString() && info[1].IsString() && info[2].IsNumber())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    std::string ip = info[1].As<Napi::String>().ToString();
    int mask = info[2].As<Napi::Number>().Int32Value();
    int result = setIpv4Addr((char*)name.data(), (char*)ip.data());
    if ((setIpv4Addr((char*)name.data(), (char*)ip.data()) == -1) ||
        (setIpv4Netmask((char*)name.data(), mask) == -1)) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, result);
}
static Napi::Value tuntapGetIfIndex(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 1) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsString())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    int ifindex = 0;
    int result = getIfIndex((char*)name.data(), &ifindex);
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, ifindex);
}
static Napi::Value tuntapSetIpv6(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (info.Length() != 3) {
        throw Napi::TypeError::New(env, "Wrong number of arguments");
    }
    if (!(info[0].IsNumber() && info[1].IsString() && info[2].IsNumber())) {
        throw Napi::TypeError::New(env, "Wrong argument(s)!");
    }
    std::string name = info[0].As<Napi::String>().ToString();
    std::string ip = info[1].As<Napi::String>().ToString();
    int result =
        setIpv6(info[0].As<Napi::Number>().Int32Value(), (char*)ip.data(),
                info[2].As<Napi::Number>().Int32Value());
    if (result == -1) {
        throwErrnoError(env, errno);
    }
    return Napi::Number::From(env, result);
}

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("tuntapInit", Napi::Function::New(env, tuntapInit));
    exports.Set("tuntapGetFlags", Napi::Function::New(env, tuntapGetFlags));
    exports.Set("tuntapSetMac", Napi::Function::New(env, tuntapSetMac));
    exports.Set("tuntapSetUp", Napi::Function::New(env, tuntapSetUp));
    exports.Set("tuntapSetDown", Napi::Function::New(env, tuntapSetDown));
    exports.Set("tuntapSetMtu", Napi::Function::New(env, tuntapSetMtu));
    exports.Set("tuntapGetMtu", Napi::Function::New(env, tuntapGetMtu));
    exports.Set("tuntapSetIpv4", Napi::Function::New(env, tuntapSetIpv4));
    exports.Set("tuntapGetIfIndex", Napi::Function::New(env, tuntapGetIfIndex));
    exports.Set("tuntapSetIpv6", Napi::Function::New(env, tuntapSetIpv6));
    return exports;
}

NODE_API_MODULE(tuntap2Addon, Init)
#endif

