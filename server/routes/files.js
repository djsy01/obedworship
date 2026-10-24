const express = require('express');
const router = express.Router();
const db = require('../config/db');

// [GET] DB(files 테이블)에 저장된 바이너리를 mime_type에 맞게 스트리밍
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT filename, mime_type, data FROM files WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });

        const file = rows[0];
        res.set('Content-Type', file.mime_type);
        res.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.filename)}"`);
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(file.data);
    } catch (error) {
        console.error('파일 서빙 에러:', error);
        res.status(500).json({ message: '파일을 불러오지 못했습니다.' });
    }
});

module.exports = router;
