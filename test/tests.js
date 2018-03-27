const assert = require('assert');
const tests = require('./build/Debug/tests');

describe('napi-thread-safe-callback.hpp', () => {

    it('should load tests module', () => {
        assert.notStrictEqual(tests, undefined);
    });

    describe('ThreadSafeCallback::ThreadSafeCallback(callback)', () => {
        it('should fail when called without arguments', () => {
            assert.throws(() => tests.constructor(), /Callback must be a function/);
        });
        it('should fail when first argument is undefined', () => {
            assert.throws(() => tests.constructor(undefined), /Callback must be a function/);
        });
        it('should fail when first argument is null', () => {
            assert.throws(() => tests.constructor(null), /Callback must be a function/);
        });
        it('should fail when first argument is boolean', () => {
            assert.throws(() => tests.constructor(false), /Callback must be a function/);
        });
        it('should fail when first argument is number', () => {
            assert.throws(() => tests.constructor(0), /Callback must be a function/);
        });
        it('should fail when first argument is string', () => {
            assert.throws(() => tests.constructor('foo'), /Callback must be a function/);
        });
        it('should fail when first argument is symbol', () => {
            assert.throws(() => tests.constructor(Symbol()), /Callback must be a function/);
        });
        it('should fail when first argument is object', () => {
            assert.throws(() => tests.constructor({}), /Callback must be a function/);
        });
        it('should succeed when first agument is function', () => {
            assert.doesNotThrow(() => tests.constructor(() => undefined));
        })
    })

    describe('ThreadSafeCallback::ThreadSafeCallback(receiver, callback)', () => {
        it('should fail when called without arguments', () => {
            assert.throws(() => tests.constructor2(), /Callback receiver must be an object or function/);
        });
        it('should fail when called with only receiver', () => {
            assert.throws(() => tests.constructor2({}), /Callback must be a function/);
        });
        it('should fail when first argument is undefined', () => {
            assert.throws(() => tests.constructor2(undefined, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is null', () => {
            assert.throws(() => tests.constructor2(null, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is boolean', () => {
            assert.throws(() => tests.constructor2(false, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is number', () => {
            assert.throws(() => tests.constructor2(0, () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is string', () => {
            assert.throws(() => tests.constructor2('foo', () => {}), /Callback receiver must be an object or function/);
        });
        it('should fail when first argument is symbol', () => {
            assert.throws(() => tests.constructor2(Symbol(), () => {}), /Callback receiver must be an object or function/);
        });
        it('should succeed when first argument is object', () => {
            assert.doesNotThrow(() => tests.constructor2({}, () => {}));
        });
        it('should succeed when first agument is function', () => {
            assert.doesNotThrow(() => tests.constructor(() => {}, () => {}));
        })
    })

    describe('ThreadSafeCallbacl::call() with callback', () => {
        it('should call callback', (done) => {
            tests.call(done);
        });

        // TODO
        // it('should crash when callback throws', function (done) {
        //     tests.test_call(() => {
        //         throw new Error('error');
        //     });
        // });


    });

    describe('ThreadSafeCallbacl::call() with receiver and callback', () => {
        it('should call callback with object receiver', (done) => {
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
        it('should call callback with function receiver', (done) => {
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

    describe('ThreadSafeCallback::call(arg_func) with callback', () => {
        it('should call callback with one undefined argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val, undefined);
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, undefined);
        });
        it('should call callback with one null argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val, null);
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, null);
        });
        it('should call callback with one boolean argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val, true);
                    assert.strictEqual(args.length, 0);
                done();
                } catch (err) {
                    done(err);
                }
            }, true);
        });
        it('should call callback with one number argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val, 42);
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, 42);
        });
        it('should call callback with one string argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val, 'foo');
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, 'foo');
        });
        it('should call callback with one symbol argument', (done) => {
            const sym = Symbol();
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val, sym);
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, sym);
        });
        it('should call callback with one object argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val.foo, 'bar');
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, {foo: 'bar'});
        });
        it('should call callback with one function argument', (done) => {
            tests.call_args((val, ...args) => {
                try {
                    assert.strictEqual(val(), 'bar');
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, () => 'bar');
        });
    });

    describe('ThreadSafeCallback::callError(message) with callback', () => {
        it('should call callback with error', (done) => {
            tests.call_error((err, ...args) => {
                try {
                    assert(err instanceof Error);
                    assert.strictEqual(err.message, 'foo');
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            })    
        });
    });

    describe('example_async_work', () => {
        it('should call callback with result', (done) => {
            tests.example_async_work((err, val, ...args) => {
                try {
                    assert.strictEqual(err, undefined);
                    assert.strictEqual(val, 'foo');
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    
        it('should call callback with error', (done) => {
            tests.example_async_work((err, ...args) => {
                try {
                    assert(err instanceof Error);
                    assert.strictEqual(err.message, 'Failure during async work');
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }, 'fail');
        });
    });

    describe('example_async_return_value', () => {
        it('should call callback with increasing integers until callback returns false', (done) => {
            let count = 1;
            tests.example_async_return_value((err, val, ...args) => {
                try {
                    assert.strictEqual(err, undefined);
                    assert.strictEqual(val, count);
                    assert.strictEqual(args.length, 0);
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

        it('should call callback with increasing integers up to 20 and then return an error', (done) => {
            let count = 1;
            tests.example_async_return_value((err, val, ...args) => {
                try {
                    assert.strictEqual(args.length, 0);
                    if (count <= 20) {
                        assert.strictEqual(err, undefined);
                        assert.strictEqual(val, count);
                        count += 1;
                        return true;
                    } else {
                        assert(err instanceof Error);
                        assert.strictEqual(err.message, 'Failure during async work');
                        assert.strictEqual(val, undefined);
                        done();
                        return false;
                    }
                } catch (err) {
                    done(err);
                }
            });
        });

        it('should survive callback throwing an exception', (done) => {
            tests.example_async_return_value((err, val, ...args) => {
                setTimeout(done, 10);
                throw new Error('JS exception');
            });
        });
    });

    describe('Lots of callbacks during sync work (#5)', () => {
        it('should not crash', (done) => {
            tests.lots_of_callbacks((err, val, ...args) => {
                try {
                    assert.strictEqual(err, undefined);
                    assert.strictEqual(args.length, 0);
                    if (val === 0) {
                        // console.log(new Date(), 'First callback');
                    }
                    if (val >= 9999) {
                        // console.log(new Date(), 'Last callback');
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            });
            // Block event loop with sync work
            // console.log(new Date(), 'Starting sync work...');
            const t_start = process.hrtime();
            while (process.hrtime(t_start)[1] < 500 * 1000 * 1000);
            // console.log(new Date(), 'Sync work finished');
        });
    });

    describe('Calling callback from main thread (#4)', () => {
        it('should not deadlock', (done) => {
            tests.call_from_main_thread((err, ...args) => {
                try {
                    assert.strictEqual(err, undefined);
                    assert.strictEqual(args.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
});