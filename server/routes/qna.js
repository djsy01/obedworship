const router = require('express').Router();
const { rows, one } = require('../utils/sql');
const { signedIn, staff } = require('../security/access');
const { presentQuestion: present } = require('../utils/qna');
const select = 'SELECT * FROM qna';
const byId = select + ' WHERE id = ?';

router.get('/', async (req, res) => {
    const category = req.query.category;
    const questions = await rows(select + (category ? ' WHERE category = ?' : '') + ' ORDER BY created_at DESC', category ? [category] : []);
    res.json(questions.map(question => present(question, req.user)));
});
router.get('/:id', async (req, res) => res.json(present(await one(byId, [req.params.id]), req.user)));
router.post('/', signedIn, async (req, res) => {
    const { category, title, content } = req.body ?? {};
    if (![category, title, content].every(v => typeof v === 'string' && v.trim())) return res.sendStatus(400);
    const result = await rows("INSERT INTO qna (user_id, category, title, content, status) VALUES (?, ?, ?, ?, 'WAITING')",
        [req.user.id, category, title, content]);
    res.status(201).json(present(await one(byId, [result.insertId]), req.user));
});
router.patch('/:id/answer', staff, async (req, res) => {
    if (typeof req.body?.answer !== 'string') return res.sendStatus(400);
    await rows("UPDATE qna SET answer = ?, status = 'ANSWERED', answer_date = CURRENT_TIMESTAMP WHERE id = ?",
        [req.body.answer, req.params.id]);
    res.json(present(await one(byId, [req.params.id]), req.user));
});
router.delete('/:id', signedIn, async (req, res) => {
    const result = await rows('DELETE FROM qna WHERE id = ? AND user_id = ?', [req.params.id, String(req.user.id)]);
    res.sendStatus(result.affectedRows ? 204 : 404);
});
module.exports = router;
