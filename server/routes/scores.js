const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const jwt = require('jsonwebtoken'); // 토큰 해독용

// 메모리에 임시 저장 후 DB files 테이블에 바이너리로 저장
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('PDF만 허용됩니다.'), false);
        }
    }
});

// JWT 검증 미들웨어 (이전 auth.js와 동일)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    jwt.verify(token, process.env.JWT_SECRET || 'obedworship_super_secret_jwt_key_2026!', (err, user) => {
        if (err) return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        req.user = user;
        next();
    });
};

// ==========================================
// [GET] 악보 전체 조회 및 필터링 (category, key, search)[cite: 12]
// ==========================================
router.get('/', async (req, res) => {
    try {
        const { category, key, search } = req.query;
        let query = 'SELECT * FROM scores WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (key) {
            query += ' AND song_key = ?';
            params.push(key);
        }
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ? OR composer LIKE ?)';
            const searchKeyword = `%${search}%`;
            params.push(searchKeyword, searchKeyword, searchKeyword);
        }

        query += ' ORDER BY created_at DESC';
        const [scores] = await db.query(query, params);
        res.status(200).json(scores);
    } catch (error) {
        res.status(500).json({ message: '악보 목록 조회 실패' });
    }
});

// ==========================================
// [GET] 단일 악보 조회[cite: 12]
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const [scores] = await db.query('SELECT * FROM scores WHERE id = ?', [req.params.id]);
        if (scores.length === 0) return res.status(404).json({ message: '악보를 찾을 수 없습니다.' });
        res.status(200).json(scores[0]);
    } catch (error) {
        res.status(500).json({ message: '악보 조회 실패' });
    }
});

// ==========================================
// [POST] 악보 파일 업로드 (DB files 테이블)
// ==========================================
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });

        // 한글 파일명 인코딩 보정
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

        const [result] = await db.query(
            'INSERT INTO files (filename, mime_type, size, data) VALUES (?, ?, ?, ?)',
            [originalName, req.file.mimetype, req.file.size, req.file.buffer]
        );

        // scores.md 명세의 Response Syntax 규격에 맞춤
        const responseData = {
            filename: originalName,
            savedFilename: originalName,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: `/files/${result.insertId}`
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('악보 파일 업로드 에러:', error);
        res.status(500).json({ message: '파일 업로드 중 서버 에러가 발생했습니다.' });
    }
});

// ==========================================
// [POST] 새 악보 메타데이터 생성[cite: 12]
// ==========================================
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        const keys = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        
        const [result] = await db.query(`INSERT INTO scores (${keys}) VALUES (${placeholders})`, Object.values(data));
        const [newScore] = await db.query('SELECT * FROM scores WHERE id = ?', [result.insertId]);
        
        res.status(201).json(newScore[0]);
    } catch (error) {
        res.status(500).json({ message: '악보 생성 실패' });
    }
});

// ==========================================
// [PATCH] 악보 메타데이터 수정[cite: 12]
// ==========================================
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE scores SET ${setClause} WHERE id = ?`, values);
        const [updatedScore] = await db.query('SELECT * FROM scores WHERE id = ?', [req.params.id]);
        
        res.status(200).json(updatedScore[0]);
    } catch (error) {
        res.status(500).json({ message: '악보 수정 실패' });
    }
});

// ==========================================
// [DELETE] 악보 삭제[cite: 12]
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM scores WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '악보 삭제 실패' });
    }
});

// ==========================================
// [GET] 악보 다운로드 (Blob 반환 및 기록)[cite: 12]
// ==========================================
router.get('/download/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [scores] = await db.query('SELECT filename, file_url FROM scores WHERE id = ?', [id]);

        if (scores.length === 0 || !scores[0].file_url) {
            return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
        }

        const fileIdMatch = scores[0].file_url.match(/\/files\/(\d+)$/);
        if (!fileIdMatch) return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });

        const [files] = await db.query('SELECT mime_type, data FROM files WHERE id = ?', [fileIdMatch[1]]);
        if (files.length === 0) return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });

        // 다운로드 이력 기록 (score_downloads 테이블)
        await db.query('INSERT INTO score_downloads (score_id, user_id) VALUES (?, ?)', [id, req.user.id]);
        // 다운로드 횟수 증가
        await db.query('UPDATE scores SET download_count = download_count + 1 WHERE id = ?', [id]);

        res.setHeader('Content-Type', files[0].mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(scores[0].filename)}"`);
        res.send(files[0].data);
    } catch (error) {
        console.error('악보 다운로드 에러:', error);
        res.status(500).json({ message: '다운로드 처리 실패' });
    }
});

module.exports = router;