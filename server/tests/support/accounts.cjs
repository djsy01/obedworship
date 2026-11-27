const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');

async function accounts(request) {
    const db = require('../../config/db');
    const password = 'Local-test1!';
    const passwordHash = await bcrypt.hash(password, 4);
    const users = {};
    for (const key of ['user', 'other', 'operator', 'admin']) {
        const role = key === 'other' ? 'user' : key;
        const email = randomUUID() + '@example.invalid';
        const [result] = await db.execute(
            'INSERT INTO users (email, password_hash, name, role, phone) VALUES (?, ?, ?, ?, ?)',
            [email, passwordHash, role, role, '010-0000-0000']
        );
        const login = await request('/auth/login', { method: 'POST', body: { email, password } });
        assert.equal(login.status, 200);
        const data = await login.json();
        assert.equal(data.data.role, role);
        users[key] = { id: result.insertId, email, token: data.token, password };
    }
    return users;
}

module.exports = { accounts };
