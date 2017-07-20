#include <napi.h>
#include "napi-thread-safe-callback.hpp"

using namespace Napi;

Value test_call(const CallbackInfo& info)
{
    auto callback = std::make_shared<ThreadSafeCallback>(info[0].As<Function>());
    std::thread([callback]
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
        callback->call();
    }).detach();
    return Boolean::New(info.Env(), true);
}

void init(Env env, Object exports, Object module)
{
    exports["test_call"] = Function::New(env, test_call, "test_call");
}

NODE_API_MODULE(tests, init);