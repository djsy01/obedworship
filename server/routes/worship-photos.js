const router = require('express').Router();
const { images, upload } = require('../security/uploads');
const { saveFile, uploadInfo } = require('../utils/files');
const { transaction } = require('../utils/sql');
const { worshipMedia } = require('../utils/content');

router.post('/upload', ...upload('file', images, 8), async (req, res) => {
    res.json(uploadInfo(req.file, await saveFile(req.file)));
});
router.post('/upload-multiple', ...upload('photos', images, 8, 5), async (req, res) => {
    const photos = await transaction(async conn => {
        const result = [];
        for (const file of req.files) {
            result.push({ photo_url: await saveFile(file, conn), file_name: file.originalname });
        }
        return result;
    });
    res.json({ count: photos.length, photos });
});
router.use(worshipMedia('worship_photos', 'photo_order ASC'));
module.exports = router;
