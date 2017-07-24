#include <napi.h>
#include "napi-thread-safe-callback.hpp"

using namespace Napi;

std::string stringify(const Value& value)
{
    auto JSON = value.Env().Global().Get("JSON").As<Napi::Object>();
    auto stringify = JSON.Get("stringify").As<Napi::Function>();
    return stringify.Call(JSON, {value}).As<Napi::String>().Utf8Value();
}

void constructor(const CallbackInfo& info)
{
    ThreadSafeCallback(info[0].As<Function>());
}

void constructor2(const CallbackInfo& info)
{
    ThreadSafeCallback(info[0].As<Object>(), info[1].As<Function>());
}

void call(const CallbackInfo& info)
{
    auto callback = std::make_shared<ThreadSafeCallback>(info[0].As<Function>());
    std::thread([callback]
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
        callback->call();
    }).detach();
}

void call2(const CallbackInfo& info)
{
    auto callback = std::make_shared<ThreadSafeCallback>(info[0], info[1].As<Function>());
    std::thread([callback]
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
        callback->call();
    }).detach();
}

void call_args(const CallbackInfo& info)
{
    auto callback = std::make_shared<ThreadSafeCallback>(info[0].As<Function>());
    std::vector<std::string> json_args;
    for (size_t i=1; i<info.Length(); ++i)
        json_args.push_back(stringify(info[i]));
    std::thread([callback, json_args]
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
        callback->call([json_args](Napi::Env env, std::vector<napi_value>& args)
        {
            auto JSON = env.Global().Get("JSON").As<Napi::Object>();
            auto parse = JSON.Get("parse").As<Napi::Function>();
            for (const auto& json_arg : json_args)
                args.push_back(parse.Call(JSON, {String::New(env, json_arg)}));
        });
    }).detach();
}

#define ADD_TEST(name) \
    exports[#name] = Function::New(env, name, #name);

void init(Env env, Object exports, Object module)
{
    ADD_TEST(constructor);
    ADD_TEST(constructor2);
    ADD_TEST(call);
    ADD_TEST(call2);
    ADD_TEST(call_args);
}

NODE_API_MODULE(tests, init);