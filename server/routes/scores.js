const router = require('express').Router();
const { rows, one, transaction, error } = require('../utils/sql');
const { contentWrites } = require('../utils/content');
const { saveFile, uploadInfo } = require('../utils/files');
const { isStaff, signedIn } = require('../security/access');
const { authorizeFile } = require('../security/file-access');
const { upload } = require('../security/uploads');
const { fileId } = require('../utils/file-links');

router.get('/', async (req, res) => {
    const conditions = [isStaff(req.user) ? '1=1' : 'is_public = 1'];
    const values = [];
    for (const [param, field] of [['category', 'category'], ['key', 'song_key']]) {
        if (req.query[param]) {
            conditions.push(field + ' = ?');
            values.push(req.query[param]);
        }
    }
    if (req.query.search) {
        conditions.push('(title LIKE ? OR description LIKE ? OR composer LIKE ?)');
        values.push(...Array(3).fill('%' + req.query.search + '%'));
    }
    res.json(await rows('SELECT * FROM scores WHERE ' + conditions.join(' AND ') + ' ORDER BY created_at DESC', values));
});
router.get('/:id', async (req, res) => {
    res.json(await one('SELECT * FROM scores WHERE id = ? AND (is_public = 1 OR ?)', [req.params.id, isStaff(req.user)]));
});
router.post('/upload', ...upload('file', ['application/pdf'], 10), async (req, res) => {
    res.json(uploadInfo(req.file, await saveFile(req.file)));
});
router.get('/download/:id', signedIn, async (req, res) => {
    const file = await transaction(async conn => {
        const score = await one('SELECT filename, file_url FROM scores WHERE id = ? AND (is_public = 1 OR ?) FOR UPDATE',
            [req.params.id, isStaff(req.user)], conn);
        const id = fileId(score.file_url);
        if (!id) throw error(404, '파일을 찾을 수 없습니다.');
        await authorizeFile(id, req.user, conn);
        const binary = await one('SELECT data FROM files WHERE id = ?', [id], conn);
        await rows('INSERT INTO score_downloads (score_id, user_id) VALUES (?, ?)', [req.params.id, String(req.user.id)], conn);
        await rows('UPDATE scores SET download_count = download_count + 1 WHERE id = ?', [req.params.id], conn);
        return { ...binary, name: score.filename };
    });
    res.attachment(file.name).set({ 'Content-Type': 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' }).send(file.data);
});
contentWrites(router, 'scores');
module.exports = router;
