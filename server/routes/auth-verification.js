const router = require('express').Router();
const { rows, error } = require('../utils/sql');
const { emailAddress } = require('../security/accounts');
const { sendVerificationEmail } = require('../utils/mailer');
const store = require('../utils/verificationStore');

function send(purpose) {
    return async (req, res) => {
        const email = emailAddress(req.body?.email);
        const [user] = await rows('SELECT email FROM users WHERE email = ?', [email]);
        if (purpose === 'register' && user) throw error(400, '이미 가입된 이메일입니다.');
        if (purpose === 'register' || user) {
            await sendVerificationEmail(user?.email ?? email, store.setCode(purpose, email));
        }
        res.json({ success: true, message: '이메일을 확인해주세요.' });
    };
}
function verify(purpose) {
    return (req, res) => {
        const email = emailAddress(req.body?.email);
        const verificationToken = store.verifyCode(purpose, email, req.body.code);
        if (!verificationToken) throw error(400, '인증번호를 확인해주세요.');
        res.set('Cache-Control', 'no-store').json({ success: true, verificationToken });
    };
}
router.post('/send-verification', send('register'));
router.post('/forgot-password', send('reset'));
router.post('/verify-code', verify('register'));
router.post('/verify-reset-code', verify('reset'));
module.exports = router;
