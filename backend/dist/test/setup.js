"use strict";
beforeAll(async () => {
    console.log('Test setup: Using mock database for CI/CD demo');
});
afterEach(async () => {
});
afterAll(async () => {
});
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001';
//# sourceMappingURL=setup.js.map