#include <napi.h>
#include "napi-thread-safe-callback.hpp"

void init(Napi::Env env, Napi::Object exports, Napi::Object module)
{

}

NODE_API_MODULE(tests, init);