const { createHmac } = require('node:crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET 환경변수가 필요합니다.');

function sessionVersion(user) {
    return createHmac('sha256', secret).update(user.password_hash).digest('base64url');
}

async function identify(req, res, next) {
    const header = req.get('Authorization');
    if (!header) return next();
    const match = /^Bearer (\S+)$/i.exec(header);
    let claims;
    try {
        claims = jwt.verify(match?.[1] || '', secret, { algorithms: ['HS256'] });
    } catch {
        return next();
    }
    if (!Number.isSafeInteger(claims?.id)) return next();
    const [[user]] = await db.execute(
        'SELECT id, role, password_hash FROM users WHERE id = ? AND is_active = 1', [claims.id]
    );
    if (!user || claims.version !== sessionVersion(user)) return next();
    req.user = { id: user.id, role: user.role };
    next();
}

const isStaff = user => ['admin', 'operator'].includes(user?.role);
function signedIn(req, res, next) {
    if (!req.user) return res.sendStatus(401);
    next();
}
function staff(req, res, next) {
    if (!req.user) return res.sendStatus(401);
    if (!isStaff(req.user)) return res.sendStatus(403);
    next();
}
function staffWrites(req, res, next) {
    if (['GET', 'HEAD'].includes(req.method)) return next();
    return staff(req, res, next);
}

module.exports = { identify, signedIn, staff, staffWrites, isStaff, secret, sessionVersion };
