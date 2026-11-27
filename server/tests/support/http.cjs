const { randomBytes } = require('node:crypto');
const { once } = require('node:events');

async function serve(test, port) {
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    Object.assign(process.env, {
        DB_HOST: '127.0.0.1', DB_PORT: port || '1', DB_USER: 'obed_test',
        DB_PASS: 'local-test-db', DB_NAME: 'obed_worship',
    });
    const db = require('../../config/db');
    const listener = require('../../app').listen(0, '127.0.0.1');
    test.after(async () => {
        await new Promise((resolve, reject) => listener.close(err => err ? reject(err) : resolve()));
        await db.end();
    });
    await once(listener, 'listening');
    const origin = 'http://127.0.0.1:' + listener.address().port;
    return (path, { method = 'GET', token, body, headers } = {}) => {
        const request = new Headers(headers);
        if (token) request.set('Authorization', 'Bearer ' + token);
        if (body && !(body instanceof FormData)) {
            request.set('Content-Type', 'application/json');
            body = JSON.stringify(body);
        }
        return fetch(origin + path, { method, headers: request, body });
    };
}

module.exports = { serve };
