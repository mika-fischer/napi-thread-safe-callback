const assert = require('assert');
const tests = require('./build/Debug/tests');

describe('napi-thread-safe-callback.hpp', function () {

    it('should load tests module', function () {
        assert(tests !== undefined);
    });

    describe('ThreadSafeCallback::ThreadSafeCallback(callback)', function () {
        it('should fail when called without arguments', function () {
            assert.throws(() => tests.constructor(), /Callback must be a function/);
        });
        it('should fail when first argument is undefined', function () {
            assert.throws(() => tests.constructor(undefined), /Callback must be a function/);
        });
        it('should fail when first argument is null', function () {
            assert.throws(() => tests.constructor(null), /Callback must be a function/);
        });
        it('should fail when first argument is boolean', function () {
            assert.throws(() => tests.constructor(false), /Callback must be a function/);
        });
        it('should fail when first argument is number', function () {
            assert.throws(() => tests.constructor(0), /Callback must be a function/);
        });
        it('should fail when first argument is string', function () {
            assert.throws(() => tests.constructor('foo'), /Callback must be a function/);
        });
        it('should fail when first argument is symbol', function () {
            assert.throws(() => tests.constructor(Symbol()), /Callback must be a function/);
        });
        it('should fail when first argument is object', function () {
            assert.throws(() => tests.constructor({}), /Callback must be a function/);
        });
        it('should succeed when first agument is function', function () {
            assert.doesNotThrow(() => tests.constructor(() => undefined));
        })
    })

    describe('ThreadSafeCallback::ThreadSafeCallback(receiver, callback)', function () {
        it('should fail when called without arguments', function () {
            assert.throws(() => tests.constructor2(), /Callback receiver must be an object or function/);
        });
        it('should fail when called with only receiver', function () {
            assert.throws(() => tests.constructor2({}), /Callback must be a function/);
        });
        it('should fail when first argument is undefined', function () {
            assert.throws(() => tests.constructor2(undefined, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is null', function () {
            assert.throws(() => tests.constructor2(null, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is boolean', function () {
            assert.throws(() => tests.constructor2(false, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is number', function () {
            assert.throws(() => tests.constructor2(0, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is string', function () {
            assert.throws(() => tests.constructor2('foo', () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is symbol', function () {
            assert.throws(() => tests.constructor2(Symbol(), () => {}), /Callback receiver must be an object or function/);
        });
        it('should succeed when first argument is object', function () {
            assert.doesNotThrow(() => tests.constructor2({}, () => {}));
        });
        it('should succeed when first agument is function', function () {
            assert.doesNotThrow(() => tests.constructor(() => {}, () => {}));
        })
    })

    describe('ThreadSafeCallbacl::call() with callback', function () {
        it('should call callback', function (done) {
            tests.call(done);
        });

        // TODO
        // it('should crash when callback throws', function (done) {
        //     tests.test_call(() => {
        //         throw new Error('error');
        //     });
        // });


    });

    describe('ThreadSafeCallbacl::call() with receiver and callback', function () {
        it('should call callback with object receiver', function (done) {
            const receiver = {foo: 'bar'}
            tests.call2(receiver, function () {
                assert(this.foo === 'bar');
                done();
            });
        });
        it('should call callback with function receiver', function (done) {
            const receiver = () => 'bar';
            tests.call2(receiver, function () {
                assert(this() === 'bar');
                done();
            });
        });
    });

    describe('ThreadSafeCallback::call(arg_func)', function () {
        it('should call callback with one string argument', function (done) {
            tests.call_args(function (arg) {
                assert(arguments.length === 1);
                assert(arg === 'foo');
                done();
            }, 'foo');
        });
    });

});