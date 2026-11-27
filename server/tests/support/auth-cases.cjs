const assert = require('node:assert/strict');
const ticketCases = require('./ticket-cases.cjs');

module.exports = async function authCases(t, request, { user, other, operator, admin }) {
    await t.test('only the owner can read and update their profile', async () => {
        const path = '/mypage/' + user.id + '/profile';
        for (const { token } of [other, operator, admin]) {
            assert.equal((await request(path, { token })).status, 403);
            assert.equal((await request(path, { method: 'PATCH', token, body: { name: 'Other' } })).status, 403);
        }
        const own = await request(path, { token: user.token });
        assert.equal(own.status, 200);
        assert.equal((await own.json()).email, user.email);
        const updated = await request(path, { method: 'PATCH', token: user.token, body: { name: 'Updated' } });
        assert.equal(updated.status, 200);
        assert.equal((await updated.json()).name, 'Updated');
        const rejected = await request(path, { method: 'PATCH', token: user.token, body: { role: 'admin' } });
        assert.equal(rejected.status, 400);
    });

    await t.test('only staff can answer and the author can delete their Q&A', async () => {
        const created = await request('/qna', { method: 'POST', token: user.token,
            body: { category: '기타', title: 'Question', content: 'Test' } });
        assert.equal(created.status, 201);
        const { id } = await created.json();
        const path = '/qna/' + id;
        for (const { token } of [user, other, operator, admin]) {
            const response = await request(path + '/answer', { method: 'PATCH', token, body: { answer: 'Answer' } });
            assert.equal(response.status, token === operator.token || token === admin.token ? 200 : 403);
        }
        assert.equal((await request(path, { method: 'DELETE', token: other.token })).status, 404);
        assert.equal((await request(path, { method: 'DELETE', token: user.token })).status, 204);
    });

    await t.test('staff-only writes use the current role from MySQL', async () => {
        const data = { title: 'Integration event', date: '2026-11-26', year: 2026 };
        for (const [account, expected] of [[user, 403], [other, 403], [operator, 201], [admin, 201]]) {
            const response = await request('/tickets', { method: 'POST', token: account.token, body: data });
            assert.equal(response.status, expected, await response.text());
        }
        const db = require('../../config/db');
        await db.execute("UPDATE users SET role = 'user' WHERE id = ?", [operator.id]);
        const response = await request('/tickets', { method: 'POST', token: operator.token, body: data });
        assert.equal(response.status, 403);
        await db.execute("UPDATE users SET role = 'operator' WHERE id = ?", [operator.id]);
    });

    await ticketCases(t, request, { user, other, operator });

    await t.test('a password change invalidates the previous session', async () => {
        const response = await request('/auth/change-password', { method: 'POST', token: other.token,
            body: { currentPassword: other.password, newPassword: 'Changed-test2!' } });
        assert.equal(response.status, 200);
        assert.equal((await request('/auth/me', { token: other.token })).status, 401);
    });
};
