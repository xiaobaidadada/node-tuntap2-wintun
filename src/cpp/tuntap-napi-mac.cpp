#include <napi.h>
#include "tuntap-methods-mac.h"


static int tun_fd = -1;
static std::string tun_name;

Napi::Value CreateTun(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    tun_fd = tun_create(tun_name);
    if (tun_fd < 0) {
        Napi::Error::New(env, "Failed to create TUN").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Object obj = Napi::Object::New(env);
    obj.Set("fd", Napi::Number::New(env, tun_fd));
    obj.Set("name", Napi::String::New(env, tun_name));
    return obj;
}

Napi::Value SetIPv4(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected ip and peer").ThrowAsJavaScriptException();
        return env.Null();
    }
    std::string ip = info[0].As<Napi::String>();
    std::string peer = info[1].As<Napi::String>();
    int ret = tun_set_ipv4(tun_name, ip, peer);
    return Napi::Number::New(env, ret);
}

// 新增关闭接口
Napi::Value CloseTun(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (tun_fd < 0) return Napi::Number::New(env, -1);
    int ret = tun_close(tun_fd);
    tun_fd = -1;
    tun_name.clear();
    return Napi::Number::New(env, ret);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("createTun", Napi::Function::New(env, CreateTun));
    exports.Set("setIPv4", Napi::Function::New(env, SetIPv4));
    exports.Set("closeTun", Napi::Function::New(env, CloseTun));
    return exports;
}

NODE_API_MODULE(tuntap2Addon, Init)
