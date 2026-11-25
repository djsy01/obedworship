const { test } = require('node:test');
const { serve } = require('./support/http.cjs');
const { accounts } = require('./support/accounts.cjs');
const authCases = require('./support/auth-cases.cjs');
const fileCases = require('./support/file-cases.cjs');

const port = process.env.OBED_TEST_DB_PORT;
test('Express authorization with MySQL', { skip: !port && 'OBED_TEST_DB_PORT is unset' }, async t => {
    const request = await serve(t, port);
    const users = await accounts(request);
    await authCases(t, request, users);
    await fileCases(t, request, users);
});
