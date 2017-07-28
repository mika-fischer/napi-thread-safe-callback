#include <napi.h>
#include "napi-thread-safe-callback.hpp"

using namespace Napi;

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
    auto stored_args = std::make_shared<std::vector<Reference<Value>>>();
    for (size_t i=1; i<info.Length(); ++i)
        stored_args->push_back(Persistent(info[i]));
    std::thread([callback, stored_args]
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        callback->call([stored_args](Env env, std::vector<napi_value>& args)
        {
            for (const auto& arg : *stored_args)
                args.push_back(arg.Value());
        });
    }).detach();
}

void call_error(const CallbackInfo& info)
{
    auto callback = std::make_shared<ThreadSafeCallback>(info[0].As<Function>());
    std::thread([callback]
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
        // callback->callError("foo");
        callback->call([](napi_env env, std::vector<napi_value>& args)
        {
            args = { Error::New(env, "foo").Value() };
        });
    }).detach();
}

void example_async_work(const CallbackInfo& info)
{
    // Capture callback in main thread
    auto callback = std::make_shared<ThreadSafeCallback>(info[0].As<Function>());
    bool fail = info.Length() > 1;

    // Pass callback to other thread
    std::thread([callback, fail]
    {
        try
        {
            // Do some work to get a result
            if (fail)
                throw std::runtime_error("Failure during async work");
            std::string result = "foo";

            // Call back with result
            callback->call([result](Env env, std::vector<napi_value>& args)
            {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = { env.Undefined(), String::New(env, result) };
            });
        }
        catch (std::exception& e)
        {
            // Call back with error
            callback->callError(e.what());
        }
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
    ADD_TEST(call_error);
    ADD_TEST(example_async_work);
}

NODE_API_MODULE(tests, init);