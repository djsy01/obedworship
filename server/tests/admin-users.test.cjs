const assert = require('node:assert/strict');
const { test } = require('node:test');
const jwt = require('jsonwebtoken');
const { serve } = require('./support/http.cjs');

test('member role management requires a current admin session', async t => {
    const request = await serve(t);
    const db = require('../config/db');
    const { sessionVersion, secret } = require('../security/access');
    const roles = { 1: 'admin', 2: 'operator', 3: 'admin', 4: 'user' };
    const account = id => ({ id, email: id + '@example.invalid', name: 'Test', role: roles[id] });
    const password_hash = 'mock-password-hash';
    const token = id => jwt.sign({ id, version: sessionVersion({ password_hash }) }, secret);
    const admin = token(1);
    const operator = token(2);
    t.mock.method(db, 'execute', async (sql, [value, id]) => {
        if (sql.includes('is_active = 1')) return [roles[value] ? [{ ...account(value), password_hash }] : []];
        if (sql.includes('ORDER BY email LIMIT 20')) {
            assert.equal(value, '%a=%=_==%');
            return [[{ ...account(4), created_at: '2026-11-27' }]];
        }
        if (sql.endsWith('FOR UPDATE')) return [roles[value] ? [account(value)] : []];
        assert.match(sql, /^UPDATE users SET role = \? WHERE id = \?$/);
        roles[id] = value;
        return [{ affectedRows: 1 }];
    });
    t.mock.method(db, 'getConnection', async () => ({
        execute: db.execute, beginTransaction: async () => {}, commit: async () => {},
        rollback: async () => {}, release: () => {},
    }));

    const search = '/admin/users?email=%20a%25_%3D%20';
    const patch = (id, token, role) => request('/admin/users/' + id + '/role', {
        token, method: 'PATCH', body: { role },
    });
    assert.equal((await request(search)).status, 401);
    assert.equal((await request(search, { token: operator })).status, 403);
    assert.equal((await request('/admin/users?email=a', { token: admin })).status, 400);
    const found = await request(search, { token: admin });
    assert.equal(found.status, 200);
    assert.deepEqual(await found.json(), { success: true, data: [{ ...account(4), created_at: '2026-11-27' }] });
    assert.equal((await patch(4, undefined, 'operator')).status, 401);
    assert.equal((await patch(4, operator, 'operator')).status, 403);
    assert.equal((await patch(4, admin, 'admin')).status, 400);
    assert.equal((await patch(1, admin, 'user')).status, 403);
    assert.equal((await patch(3, admin, 'user')).status, 403);
    assert.equal((await patch(5, admin, 'user')).status, 404);
    const updated = await patch(4, admin, 'operator');
    assert.equal(updated.status, 200);
    assert.deepEqual(await updated.json(), { success: true, data: { ...account(4), role: 'operator' } });
    assert.equal(roles[4], 'operator');
    assert.equal((await patch(2, admin, 'user')).status, 200);
    assert.equal((await request(search, { token: operator })).status, 403);
});
