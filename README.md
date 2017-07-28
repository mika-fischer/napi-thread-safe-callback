# Napi Thread-Safe Callback

[![npm](https://img.shields.io/npm/v/napi-thread-safe-callback.svg)](https://www.npmjs.com/package/napi-thread-safe-callback)
[![Build Status](https://travis-ci.org/mika-fischer/napi-thread-safe-callback.svg?branch=master)](https://travis-ci.org/mika-fischer/napi-thread-safe-callback)
[![Build status](https://ci.appveyor.com/api/projects/status/475okhfy85tkeah7?svg=true)](https://ci.appveyor.com/project/mika-fischer/napi-thread-safe-callback)
[![dependencies Status](https://david-dm.org/mika-fischer/napi-thread-safe-callback/status.svg?style=flat)](https://david-dm.org/mika-fischer/napi-thread-safe-callback)
[![devDependencies Status](https://david-dm.org/mika-fischer/napi-thread-safe-callback/dev-status.svg?style=flat)](https://david-dm.org/mika-fischer/napi-thread-safe-callback?type=dev)

This package contains a header-only C++ helper class to facilitate
calling back into JavaScript from threads other than the Node.JS main thread.

# Examples

## Perform async work in new thread and call back with result/error
```C++
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
            callback->call([result](Napi::Env env, std::vector<napi_value>& args)
            {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = { env.Undefined(), Napi::String::New(env, result) };
            });
        }
        catch (std::exception& e)
        {
            // Call back with error
            callback->callError(e.what());
        }
    }).detach();
}
```

## Perform async work in new thread, call back with result/error and check return value
```C++
void example_async_return_value(const CallbackInfo& info)
{
    auto callback = std::make_shared<ThreadSafeCallback>(info[0].As<Function>());
    std::thread([callback]
    {
        try
        {
            int result = 0;
            while (true)
            {
                // Do some work...
                try
                {
                    result += 1;
                    if (result > 20)
                        throw std::runtime_error("Failure during async work");
                }
                catch (std::exception &e)
                {
                    // Call back with error
                    // Note that this will cause the thread to exit and the
                    // ThreadSafeCallback to be destroyed. But the callback
                    // will still be called, even afterwards
                    callback->callError(e.what());
                    throw;
                }
                // Call back into Javascript with current result
                auto future = callback->call<bool>(
                    [result](Env env, std::vector<napi_value> &args) {
                        args = {env.Undefined(), Number::New(env, result)};
                    },
                    [](const Value &val) {
                        return val.As<Boolean>().Value();
                    });
                // This blocks until the JS call has returned a value
                // In case the callback throws we just let the exception
                // bubble up and end the thread
                auto continue_running = future.get();
                if (!continue_running)
                    break;
            }
        }
        catch (...) 
        {
            // Ignore errors
        }
    }).detach();
}
```

## Usage

  1. Add a dependency on this package to `package.json`:
```json
  "dependencies": {
    "napi-thread-safe-callback": "0.0.1",
  }
```

  2. Reference this package's include directory in `binding.gyp`:
```gyp
  'include_dirs': ["<!@(node -p \"require('napi-thread-safe-callback').include\")"],
```
  3. Include the header in your code:
```C++
#include "napi-thread-safe-callback.hpp"
```

### Exception handling

Exceptions need to be enabled in the native module. To do this use the following
in `binding.gyp`:
```gyp
  'cflags!': [ '-fno-exceptions' ],
  'cflags_cc!': [ '-fno-exceptions' ],
  'xcode_settings': {
    'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
    'CLANG_CXX_LIBRARY': 'libc++',
    'MACOSX_DEPLOYMENT_TARGET': '10.7',
  },
  'msvs_settings': {
    'VCCLCompilerTool': { 'ExceptionHandling': 1 },
  },
  'conditions': [
    ['OS=="win"', { 'defines': [ '_HAS_EXCEPTIONS=1' ] }]
  ]
```
