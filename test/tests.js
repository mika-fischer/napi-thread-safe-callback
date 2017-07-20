const assert = require('assert');
const tests = require('./build/Debug/tests');

describe('napi-thread-safe-callback', function () {

    it('should load tests module', function () {
        assert(tests !== undefined);
    });

    describe('test-call', function () {
        it('should fail when first argument is undefined', function () {
            assert.throws(() => tests.test_call());
        });
            
        it('should return true and call callback', function (done) {
            assert(tests.test_call(done) === true);
        });

        // it('should crash when callback throws', function (done) {
        //     assert(tests.test_call(() => {
        //         throw new Error('error');
        //     }) === true);
        // });

    });
});