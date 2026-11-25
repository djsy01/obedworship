const router = require('express').Router();
const { rows, one } = require('../utils/sql');
const { contentWrites } = require('../utils/content');
const { isStaff } = require('../security/access');
const { upload, images } = require('../security/uploads');
const { saveFile } = require('../utils/files');
const { withRelations, registerRelations } = require('../utils/member-relations');

router.get('/', async (req, res) => {
    const values = [isStaff(req.user) && req.query.active !== 'true'];
    let sql = 'SELECT * FROM members WHERE (is_active = 1 OR ?)';
    if (req.query.affiliation) {
        sql += ' AND affiliation = ?';
        values.push(req.query.affiliation);
    }
    res.json(await Promise.all((await rows(sql, values)).map(withRelations)));
});
router.get('/:id', async (req, res) => {
    const member = await one('SELECT * FROM members WHERE id = ? AND (is_active = 1 OR ?)',
        [req.params.id, isStaff(req.user)]);
    res.json(await withRelations(member));
});
router.post('/upload-photo', ...upload('photo', images, 8), async (req, res) => {
    res.json({ photo_url: await saveFile(req.file) });
});
registerRelations(router);
contentWrites(router, 'members');
module.exports = router;
