const router = require('express').Router();
const { one, rows, insert } = require('../utils/sql');
const { contentWrites } = require('../utils/content');
const { tickets } = require('../utils/fields');

router.get('/', async (req, res) => {
    const clauses = [];
    const params = [];
    for (const key of ['status', 'year']) {
        if (req.query[key]) {
            clauses.push(key + ' = ?');
            params.push(req.query[key]);
        }
    }
    const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
    res.json(await rows('SELECT * FROM tickets' + where + ' ORDER BY created_at DESC', params));
});
router.get('/:id', async (req, res) => res.json(await one('SELECT * FROM tickets WHERE id = ?', [req.params.id])));
router.post('/from-worship', async (req, res) => {
    const worship = await one('SELECT title, date, year, location AS place, preacher, poster_url FROM worship_logs WHERE id = ?',
        [req.body.worship_id]);
    const id = await insert('tickets', { ...worship, status: 'OPEN', ...req.body }, tickets);
    res.status(201).json(await one('SELECT * FROM tickets WHERE id = ?', [id]));
});
contentWrites(router, 'tickets');
module.exports = router;
