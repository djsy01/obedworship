const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // JWT 라이브러리 추가

const SALT_ROUNDS = 10;
// 환경 변수가 없을 경우를 대비한 기본값 (실제 배포시엔 반드시 .env 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'obedworship_super_secret_jwt_key_2026!';

/**
 * DB의 사용자 레코드를 프론트엔드 User 인터페이스에 맞게 필터링 및 변환
 */
const formatUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    is_active: Boolean(user.is_active),
    email_verified: Boolean(user.email_verified),
    created_at: user.created_at,
    last_login_at: user.last_login_at
});

/**
 * 🔒 [미들웨어] JWT 토큰 검증
 * 프론트엔드 axios.ts에서 보낸 Authorization: Bearer {token} 을 검사합니다.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer 토큰값' 에서 토큰값만 분리

    if (!token) {
        return res.status(401).json({ success: false, message: '인증 토큰이 제공되지 않았습니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ success: false, message: '유효하지 않거나 만료된 토큰입니다.' });
        }
        req.user = user; // 해독된 정보(id, role 등)를 req.user에 저장
        next();
    });
};

// ==========================================
// 1. [POST] 회원가입 (register)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: '이미 가입된 이메일입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const insertQuery = `
            INSERT INTO users (email, password_hash, name, phone, role, is_active, email_verified) 
            VALUES (?, ?, ?, ?, 'user', true, false)
        `;
        const [result] = await db.query(insertQuery, [email, hashedPassword, name, phone || null]);
        const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: formatUser(newUser[0])
        });
    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ success: false, message: '회원가입 처리 중 서버 에러가 발생했습니다.' });
    }
});

// ==========================================
// 2. [POST] 로그인 (login) - JWT 발급
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        }

        await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // 🔥 JWT 생성 (페이로드에 id와 role 저장, 유효기간 1일)
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: '로그인 성공',
            token: token, // 프론트엔드에서 받아서 localStorage에 저장해야 함
            data: formatUser(user)
        });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ success: false, message: '로그인 처리 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// 3. [POST] 로그아웃 (logout)
// ==========================================
router.post('/logout', (req, res) => {
    // JWT는 stateless(무상태)이므로 백엔드에서 토큰을 파기할 필요가 없습니다.
    // 프론트엔드가 localStorage에서 토큰을 삭제하도록 유도만 하면 됩니다.
    res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
});

// ==========================================
// 4. [GET] 현재 세션(토큰) 상태 확인 (checkSession)
// ==========================================
router.get('/session', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(200).json({ success: true, authenticated: false, data: null });
    }

    try {
        // 토큰 유효성 검사
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const [users] = await db.query('SELECT id, email, role, name FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(200).json({ success: true, authenticated: false, data: null });
        }

        res.status(200).json({
            success: true,
            authenticated: true,
            data: {
                userId: users[0].id,
                email: users[0].email,
                role: users[0].role,
                name: users[0].name
            }
        });
    } catch (error) {
        // 토큰 만료 등 에러 발생 시
        console.error('토큰 검증 실패:', error.message);
        res.status(200).json({ success: true, authenticated: false, data: null });
    }
});

// ==========================================
// 5. [GET] 현재 내 정보 조회 (getCurrentUser)
// ==========================================
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // 미들웨어를 통과했으므로 req.user.id 가 존재함
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

        res.status(200).json({ success: true, data: formatUser(users[0]) });
    } catch (error) {
        console.error('내 정보 조회 에러:', error);
        res.status(500).json({ success: false, message: '정보 조회 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// 6. [POST] 비밀번호 변경 (changePassword)
// ==========================================
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

        res.status(200).json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error('비밀번호 변경 에러:', error);
        res.status(500).json({ success: false, message: '비밀번호 변경 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// 7. [POST] 비밀번호 초기화 요청 (forgotPassword)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(200).json({ success: true, message: '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000); // 1시간 후 만료

        await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [resetToken, tokenExpires, email]);
        
        console.log(`[Email Mock] ${email}로 토큰 발송: ${resetToken}`);

        res.status(200).json({ success: true, message: '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.' });
    } catch (error) {
        console.error('비밀번호 초기화 요청 에러:', error);
        res.status(500).json({ success: false, message: '요청 처리 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// 8. [POST] 비밀번호 재설정 수행 (resetPassword)
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        const [users] = await db.query('SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > CURRENT_TIMESTAMP', [email, resetToken]);
        
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: '유효하지 않거나 만료된 토큰입니다.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        await db.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedNewPassword, users[0].id]);

        res.status(200).json({ success: true, message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.' });
    } catch (error) {
        console.error('비밀번호 재설정 에러:', error);
        res.status(500).json({ success: false, message: '비밀번호 재설정 중 에러가 발생했습니다.' });
    }
});

module.exports = router;