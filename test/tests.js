const assert = require('assert');
const tests = require('./build/Release/tests');

describe('napi-thread-safe-callback', () => {
    it('should load tests module', () => {
        assert(tests !== undefined);
    })
});