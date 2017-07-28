const assert = require('assert');
const tests = require('./build/Debug/tests');

describe('napi-thread-safe-callback.hpp', function () {

    it('should load tests module', function () {
        assert.notStrictEqual(tests, undefined);
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
                try {
                    assert.strictEqual(this.foo, 'bar');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
        it('should call callback with function receiver', function (done) {
            const receiver = () => 'bar';
            tests.call2(receiver, function () {
                try {
                    assert.strictEqual(this(), 'bar');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    describe('ThreadSafeCallback::call(arg_func) with callback', function () {
        it('should call callback with one undefined argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert.strictEqual(arg, undefined);
                    done();
                } catch (err) {
                    done(err);
                }
            }, undefined);
        });
        it('should call callback with one null argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert.strictEqual(arg, null);
                    done();
                } catch (err) {
                    done(err);
                }
            }, null);
        });
        it('should call callback with one boolean argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert.strictEqual(arg, true);
                done();
                } catch (err) {
                    done(err);
                }
            }, true);
        });
        it('should call callback with one number argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert.strictEqual(arg, 42);
                    done();
                } catch (err) {
                    done(err);
                }
            }, 42);
        });
        it('should call callback with one string argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert(arguments.length, 1);
                    assert(arg, 'foo');
                    done();
                } catch (err) {
                    done(err);
                }
            }, 'foo');
        });
        it('should call callback with one symbol argument', function (done) {
            const sym = Symbol();
            tests.call_args(function (arg) {
                try {
                    assert(arguments.length, 1);
                    assert(arg, sym);
                    done();
                } catch (err) {
                    done(err);
                }
            }, sym);
        });
        it('should call callback with one object argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert.strictEqual(arg.foo, 'bar');
                    done();
                } catch (err) {
                    done(err);
                }
            }, {foo: 'bar'});
        });
        it('should call callback with one function argument', function (done) {
            tests.call_args(function (arg) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert.strictEqual(arg(), 'bar');
                    done();
                } catch (err) {
                    done(err);
                }
            }, () => 'bar');
        });
    });

    describe('ThreadSafeCallback::callError(message) with callback', function () {
        it('should call callback with error', function (done) {
            tests.call_error(function (err) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert(err instanceof Error);
                    assert.strictEqual(err.message, 'foo');
                    done();
                } catch (err) {
                    done(err);
                }
            })    
        });
    });

    describe('example_async_work', function () {
        it('should call callback with result', function (done) {
            tests.example_async_work(function (err, arg) {
                try {
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(err, undefined);
                    assert.strictEqual(arg, 'foo');
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    
        it('should call callback with error', function (done) {
            tests.example_async_work(function (err) {
                try {
                    assert.strictEqual(arguments.length, 1);
                    assert(err instanceof Error);
                    assert.strictEqual(err.message, 'Failure during async work');
                    done();
                } catch (err) {
                    done(err);
                }
            }, 'fail');
        });
    });

    describe('example_async_return_value', function () {
        it('should call callback with increasing integers until callback returns false', function (done) {
            let count = 1;
            tests.example_async_return_value(function (err, arg) {
                try {
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(err, undefined);
                    assert.strictEqual(arg, count);
                    if (count < 10) {
                        count += 1;
                        return true;
                    } else {
                        done();
                        return false;
                    }
                } catch (err) {
                    done(err);
                }
            });
        });

        it('should call callback with increasing integers up to 20 and then return an error', function (done) {
            let count = 1;
            tests.example_async_return_value(function (err, arg) {
                try {
                    if (count <= 20) {
                        assert.strictEqual(arguments.length, 2);
                        assert.strictEqual(err, undefined);
                        assert.strictEqual(arg, count);
                        count += 1;
                        return true;
                    } else {
                        assert.strictEqual(arguments.length, 1);
                        assert(err instanceof Error);
                        assert.strictEqual(err.message, 'Failure during async work');
                        done();
                        return false;
                    }
                } catch (err) {
                    done(err);
                }
            });
        });

        it('should survive callback throwing an exception', function (done) {
            tests.example_async_return_value(function (err, arg) {
                setTimeout(done, 10);
                throw new Error('JS exception');
            });
        });
    });
});