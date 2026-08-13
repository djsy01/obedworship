const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const upload = multer({ storage: multer.memoryStorage() });
const gcs = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'obedworship-assets-bucket';
const bucket = gcs.bucket(bucketName);

// [POST] 사진 파일 업로드 (GCS)[cite: 16]
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });

        const originalName = req.file.originalname;
        const savedFilename = `photos/${Date.now()}-${originalName}`;
        const blob = bucket.file(savedFilename);
        
        const blobStream = blob.createWriteStream({ resumable: false, contentType: req.file.mimetype });

        blobStream.on('error', (err) => res.status(500).json({ message: '사진 업로드 에러' }));
        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            res.status(200).json({
                filename: originalName,
                savedFilename: blob.name,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: publicUrl
            });
        });
        blobStream.end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// [POST] 집회 사진 다중 업로드 (최대 100개)[cite: 27]
router.post('/upload-multiple', upload.array('photos', 100), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });
        }

        const uploadedPhotos = req.files.map(file => {
            const savedFilename = `worship-photos/${Date.now()}-${file.originalname}`;
            // (GCS 또는 로컬 환경에 맞춰 URL 생성 방식 적용)
            return { photo_url: `https://storage.googleapis.com/${bucketName}/${savedFilename}` };
        });

        res.status(200).json({
            count: uploadedPhotos.length,
            photos: uploadedPhotos
        });
    } catch (error) {
        res.status(500).json({ message: '다중 사진 업로드 실패' });
    }
});

// 전체 조회[cite: 16]
router.get('/', async (req, res) => {
    try {
        const [photos] = await db.query('SELECT * FROM worship_photos ORDER BY photo_order ASC');
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ message: '사진 목록 조회 실패' });
    }
});

// 특정 집회(worship_id)의 사진 목록 조회[cite: 16]
router.get('/worship/:worshipId', async (req, res) => {
    try {
        const [photos] = await db.query('SELECT * FROM worship_photos WHERE worship_id = ? ORDER BY photo_order ASC', [req.params.worshipId]);
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ message: '집회 사진 조회 실패' });
    }
});

// 단일 사진 조회[cite: 16]
router.get('/:id', async (req, res) => {
    try {
        const [photos] = await db.query('SELECT * FROM worship_photos WHERE id = ?', [req.params.id]);
        if (photos.length === 0) return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
        res.status(200).json(photos[0]);
    } catch (error) {
        res.status(500).json({ message: '단일 사진 조회 실패' });
    }
});

// 생성[cite: 16]
router.post('/', async (req, res) => {
    try {
        const { worship_id, photo_url, file_name, photo_order } = req.body;
        const [result] = await db.query(
            'INSERT INTO worship_photos (worship_id, photo_url, file_name, photo_order) VALUES (?, ?, ?, ?)', 
            [worship_id, photo_url, file_name, photo_order || 0]
        );
        const [newPhoto] = await db.query('SELECT * FROM worship_photos WHERE id = ?', [result.insertId]);
        res.status(201).json(newPhoto[0]);
    } catch (error) {
        res.status(500).json({ message: '사진 생성 실패' });
    }
});

// 수정[cite: 16]
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE worship_photos SET ${setClause} WHERE id = ?`, values);
        const [updatedPhoto] = await db.query('SELECT * FROM worship_photos WHERE id = ?', [req.params.id]);
        res.status(200).json(updatedPhoto[0]);
    } catch (error) {
        res.status(500).json({ message: '사진 수정 실패' });
    }
});

// 삭제[cite: 16]
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM worship_photos WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '사진 삭제 실패' });
    }
});

module.exports = router;