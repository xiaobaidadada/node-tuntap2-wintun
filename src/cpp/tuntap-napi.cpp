
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

// int init_do = 0;
static Napi::Value node_init(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    // if(init_do == 0)
    // {
        initAnGetWintun();
    // }
    // init_do = 1;
    return  Napi::Number::From(env,1);
};

bool parseGuid(const std::string& str, GUID& outGuid) {
    unsigned int d1, d2, d3;
    unsigned int d4[8];

    if (sscanf_s(
            str.c_str(),
            "%8x-%4x-%4x-%2x%2x-%2x%2x%2x%2x%2x%2x",
            &d1, &d2, &d3,
            &d4[0], &d4[1],
            &d4[2], &d4[3], &d4[4], &d4[5], &d4[6], &d4[7]) != 11) {
        return false;
    }

    outGuid.Data1 = d1;
    outGuid.Data2 = static_cast<unsigned short>(d2);
    outGuid.Data3 = static_cast<unsigned short>(d3);
    for (int i = 0; i < 8; ++i) {
        outGuid.Data4[i] = static_cast<unsigned char>(d4[i]);
    }

    return true;
}

static Napi::Value node_set_ipv4(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    if (!IsRunningAsAdmin())
    {
        // 不是管理员
        Napi::Error::New(env, "not admin ").ThrowAsJavaScriptException();
        return env.Null();
    }
    std::string name = info[0].As<Napi::String>().ToString();
    std::string ip = info[1].As<Napi::String>().ToString();
    int mask = info[2].As<Napi::Number>().Int32Value();
     GUID guid;
     GUID* guidPtr = nullptr;

    // 判断是否传入了第四个参数（guid 字符串）
    if (info.Length() >= 4 && info[3].IsString()) {
        std::string guidStr = info[3].As<Napi::String>();
        if (!parseGuid(guidStr, guid)) {
            Napi::Error::New(env, "Invalid GUID string").ThrowAsJavaScriptException();
            return env.Null();
        }
        guidPtr = &guid;
    }
    auto adapter_name = charToWchar(name.c_str());
    if(createAdapter(adapter_name,guidPtr) != 0) {
         Napi::Error::New(env, "error").ThrowAsJavaScriptException();
                return env.Null();
    }
    if(setIpv4AddrMask(ip.c_str(),mask) != 0) {
        Napi::Error::New(env, "error").ThrowAsJavaScriptException();
        return env.Null();
    }
    return  Napi::Number::From(env,1);
}

static Napi::Value node_on_data(const Napi::CallbackInfo& info) {

    const Napi::Env& env = info.Env();
    if (th_doing != 0) {
        return Napi::Boolean::New(env, false);
    }
    th_doing = 1;
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
    receivePacket(env,tsfn);
    return  Napi::Number::From(env,1);
}
static  Napi::Value node_close(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    th_doing = 0;
    close();
    return  Napi::Number::From(env,1);
}
// 发送数据到网卡
static  Napi::Value node_send_data(const Napi::CallbackInfo& info) {
    const Napi::Env& env = info.Env();
    Napi::Buffer<byte> data = info[0].As<Napi::Buffer<byte>>();
    size_t bufferLength = data.Length();
    send_data(data.Data(),bufferLength);
    return  Napi::Number::From(env,1);
}
static void node_set_dll_path(const Napi::CallbackInfo& info){
    const Napi::Env& env = info.Env();
    std::string path = info[0].As<Napi::String>().ToString();
    wintunn_path = charToWchar(path.c_str());
}
static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("init", Napi::Function::New(env, node_init));
    exports.Set("set_ipv4", Napi::Function::New(env, node_set_ipv4));
    exports.Set("on_data", Napi::Function::New(env, node_on_data));
    exports.Set("close", Napi::Function::New(env, node_close));
    exports.Set("send_data", Napi::Function::New(env, node_send_data));
    exports.Set("set_dll_path", Napi::Function::New(env, node_set_dll_path));
    return exports;
}

NODE_API_MODULE(tuntap2Addon, Init)
#endif


#ifdef __linux__

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

