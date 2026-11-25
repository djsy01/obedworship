const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { identify, signedIn } = require('../security/access');
const { one } = require('../utils/sql');
const { profileFields } = require('../security/accounts');

router.post('/logout', (req, res) => res.json({ success: true }));
router.get('/session', identify, async (req, res) => {
    if (!req.user) return res.json({ success: true, authenticated: false, data: null });
    const data = await one('SELECT id AS userId, email, role, name FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, authenticated: true, data });
});
router.get('/me', identify, signedIn, async (req, res) => {
    res.json({ success: true, data: await one('SELECT ' + profileFields + ' FROM users WHERE id = ?', [req.user.id]) });
});
for (const paths of [
    ['/login', '/change-password'],
    ['/send-verification', '/verify-code', '/register'],
    ['/forgot-password', '/verify-reset-code', '/reset-password'],
]) {
    router.use(paths, rateLimit({ windowMs: 900000, limit: 10, standardHeaders: true, legacyHeaders: false,
        message: { success: false, message: '잠시 후 다시 시도해주세요.' } }));
}
router.use(require('./auth-verification'));
router.use(require('./auth-account'));
module.exports = router;
