const router = require('express').Router();
const { rows, one, insert, update, transaction, error } = require('../utils/sql');
const { worship_logs: columns } = require('../utils/fields');
const { includeSongs, replaceSongs } = require('../utils/worship-songs');
const byId = 'SELECT * FROM worship_logs WHERE id = ?';

function payload(input = {}) {
    const { opening_songs, celebration_songs, ...fields } = input;
    if (Object.hasOwn(fields, 'excluded_songs')) {
        if (!Array.isArray(fields.excluded_songs) || fields.excluded_songs.some(song => typeof song !== 'string')) {
            throw error(400, '제외할 곡 목록을 확인해주세요.');
        }
        fields.excluded_songs = JSON.stringify(fields.excluded_songs);
    }
    return { fields, lists: { opening: opening_songs, celebration: celebration_songs } };
}
async function getWorship(id) {
    const [worship] = await includeSongs([await one(byId, [id])]);
    return worship;
}
router.get('/', async (req, res) => {
    const year = req.query.year;
    const filter = year ? ' WHERE year = ?' : '';
    const worships = await rows('SELECT * FROM worship_logs' + filter + ' ORDER BY date DESC', year ? [year] : []);
    res.json(await includeSongs(worships));
});
router.get('/:id', async (req, res) => res.json(await getWorship(req.params.id)));
router.post('/', async (req, res) => {
    const { fields, lists } = payload(req.body);
    const id = await transaction(async conn => {
        const created = await insert('worship_logs', fields, columns, conn);
        await replaceSongs(conn, created, lists);
        return created;
    });
    res.status(201).json(await getWorship(id));
});
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { fields, lists } = payload(req.body);
    await transaction(async conn => {
        await one('SELECT id FROM worship_logs WHERE id = ? FOR UPDATE', [id], conn);
        if (Object.keys(fields).length) await update('worship_logs', fields, columns, 'id = ?', [id], conn);
        await replaceSongs(conn, id, lists);
    });
    res.json(await getWorship(id));
});
router.delete('/:id', async (req, res) => {
    const result = await rows('DELETE FROM worship_logs WHERE id = ?', [req.params.id]);
    res.sendStatus(result.affectedRows ? 204 : 404);
});
module.exports = router;
