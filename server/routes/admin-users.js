const router = require('express').Router();
const { adminOnly } = require('../security/access');
const { rows, one, update, fields, transaction, error } = require('../utils/sql');

router.use(adminOnly);
router.get('/', async (req, res) => {
    const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
    if (email.length < 2) throw error(400, '이메일을 두 글자 이상 입력해주세요.');
    const pattern = `%${email.replace(/[=%_]/g, '=$&')}%`;
    const data = await rows(
        "SELECT id, email, name, role, created_at FROM users WHERE email LIKE ? ESCAPE '=' ORDER BY email LIMIT 20",
        [pattern]
    );
    res.json({ success: true, data });
});

router.patch('/:id/role', async (req, res) => {
    fields(req.body, 'role');
    const id = Number(req.params.id);
    const { role } = req.body;
    if (!/^[1-9]\d*$/.test(req.params.id) || !Number.isSafeInteger(id)) throw error(400, '회원 ID를 확인해주세요.');
    if (role !== 'user' && role !== 'operator') throw error(400, '일반 사용자 또는 운영자만 지정할 수 있습니다.');
    if (id === req.user.id) throw error(403, '본인의 권한은 변경할 수 없습니다.');

    const data = await transaction(async conn => {
        const target = await one('SELECT id, email, name, role FROM users WHERE id = ? FOR UPDATE', [id], conn);
        if (target.role === 'admin') throw error(403, '관리자의 권한은 변경할 수 없습니다.');
        if (target.role !== role) await update('users', { role }, 'role', 'id = ?', [id], conn);
        return { ...target, role };
    });
    res.json({ success: true, data });
});

module.exports = router;
