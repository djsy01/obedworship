const { one, rows, insert, update } = require('./sql');
const columns = require('./fields');

function contentWrites(router, table, format = row => row, prepare = body => body) {
    const select = 'SELECT * FROM ' + table + ' WHERE id = ?';
    router.post('/', async (req, res) => {
        const id = await insert(table, prepare(req.body), columns[table]);
        res.status(201).json(format(await one(select, [id])));
    });
    router.patch('/:id', async (req, res) => {
        await update(table, prepare(req.body), columns[table], 'id = ?', [req.params.id]);
        res.json(format(await one(select, [req.params.id])));
    });
    router.delete('/:id', async (req, res) => {
        const result = await rows('DELETE FROM ' + table + ' WHERE id = ?', [req.params.id]);
        res.sendStatus(result.affectedRows ? 204 : 404);
    });
}

function worshipMedia(table, order) {
    const router = require('express').Router();
    const select = 'SELECT * FROM ' + table;
    router.get('/', async (req, res) => res.json(await rows(select + ' ORDER BY ' + order)));
    router.get('/worship/:id', async (req, res) => {
        res.json(await rows(select + ' WHERE worship_id = ? ORDER BY ' + order, [req.params.id]));
    });
    router.get('/:id', async (req, res) => res.json(await one(select + ' WHERE id = ?', [req.params.id])));
    contentWrites(router, table);
    return router;
}

module.exports = { contentWrites, worshipMedia };
