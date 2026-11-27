const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { rows, one, error } = require('../utils/sql');
const { identify, signedIn, secret, sessionVersion } = require('../security/access');
const { emailAddress, password, profileFields } = require('../security/accounts');
const { consume } = require('../utils/verificationStore');

function verifiedEmail(purpose, input) {
    const email = emailAddress(input.email);
    if (!consume(purpose, email, input.verificationToken)) throw error(400, '이메일을 다시 인증해주세요.');
    return email;
}
router.post('/register', async (req, res) => {
    const input = req.body ?? {};
    const value = password(input.password);
    if (typeof input.name !== 'string' || !input.name.trim()) throw error(400, '이름을 입력해주세요.');
    const email = verifiedEmail('register', input);
    const hash = await bcrypt.hash(value, 10);
    try {
        const result = await rows("INSERT INTO users (email, password_hash, name, phone, role, is_active, email_verified) VALUES (?, ?, ?, ?, 'user', 1, 1)",
            [email, hash, input.name, input.phone ?? null]);
        const data = await one('SELECT ' + profileFields + ' FROM users WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw error(409, '이미 가입된 이메일입니다.');
        throw err;
    }
});
router.post('/login', async (req, res) => {
    const email = emailAddress(req.body?.email);
    const [user] = await rows('SELECT ' + profileFields + ', password_hash FROM users WHERE email = ?', [email]);
    if (!user || typeof req.body.password !== 'string' || !await bcrypt.compare(req.body.password, user.password_hash)) {
        throw error(401, '이메일 또는 비밀번호를 확인해주세요.');
    }
    if (!user.is_active) throw error(403, '비활성화된 계정입니다.');
    const version = sessionVersion(user);
    delete user.password_hash;
    await rows('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, version }, secret, { expiresIn: '1d' });
    res.set('Cache-Control', 'no-store').json({ success: true, data: user, token });
});
router.post('/reset-password', async (req, res) => {
    const input = req.body ?? {};
    const value = password(input.newPassword);
    const email = verifiedEmail('reset', input);
    const hash = await bcrypt.hash(value, 10);
    await rows('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);
    res.json({ success: true });
});
router.post('/change-password', identify, signedIn, async (req, res) => {
    const value = password(req.body?.newPassword);
    const user = await one('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (typeof req.body.currentPassword !== 'string' || !await bcrypt.compare(req.body.currentPassword, user.password_hash)) {
        throw error(400, '현재 비밀번호를 확인해주세요.');
    }
    await rows('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(value, 10), req.user.id]);
    res.json({ success: true });
});
module.exports = router;
