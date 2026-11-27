const router = require('express').Router();
const { rows, one, insert } = require('../utils/sql');
const { assets } = require('../utils/fields');
const { isStaff } = require('../security/access');
const { upload, media, oneAssetUpload } = require('../security/uploads');
const { patchAsset, removeAsset, saveAsset } = require('../utils/asset-files');
const select = 'SELECT * FROM assets WHERE (is_active = 1 OR ?)';

router.get('/', async (req, res) => {
    const category = req.query.category;
    const values = [isStaff(req.user)];
    if (category) values.push(category);
    res.json(await rows(select + (category ? ' AND category = ?' : ''), values));
});
router.get('/key/:key', async (req, res) => {
    res.json(await one(select + ' AND asset_key = ?', [isStaff(req.user), req.params.key]));
});
router.get('/:id', async (req, res) => {
    res.json(await one(select + ' AND id = ?', [isStaff(req.user), req.params.id]));
});
router.patch('/key/:key', async (req, res) => {
    res.json(await patchAsset('asset_key', req.params.key, req.body));
});
router.post('/upload', oneAssetUpload(), ...upload('file', media, 150), async (req, res) => {
    if (!req.body.asset_key || !req.body.category) return res.sendStatus(400);
    const { record, status } = await saveAsset(req.file, req.body);
    res.status(status).json(record);
});
router.post('/', async (req, res) => {
    const id = await insert('assets', req.body, assets);
    res.status(201).json(await one('SELECT * FROM assets WHERE id = ?', [id]));
});
router.patch('/:id', async (req, res) => {
    res.json(await patchAsset('id', req.params.id, req.body));
});
router.delete('/:id', async (req, res) => {
    await removeAsset(req.params.id);
    res.sendStatus(204);
});
module.exports = router;
