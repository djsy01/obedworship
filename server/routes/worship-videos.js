const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 전체 조회[cite: 15]
router.get('/', async (req, res) => {
    try {
        const [videos] = await db.query('SELECT * FROM worship_videos ORDER BY video_order ASC');
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: '영상 목록 조회 실패' });
    }
});

// 특정 집회(worship_id)의 영상 목록 조회[cite: 15]
router.get('/worship/:worshipId', async (req, res) => {
    try {
        const [videos] = await db.query('SELECT * FROM worship_videos WHERE worship_id = ? ORDER BY video_order ASC', [req.params.worshipId]);
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: '집회 영상 조회 실패' });
    }
});

// 단일 영상 조회[cite: 15]
router.get('/:id', async (req, res) => {
    try {
        const [videos] = await db.query('SELECT * FROM worship_videos WHERE id = ?', [req.params.id]);
        if (videos.length === 0) return res.status(404).json({ message: '영상을 찾을 수 없습니다.' });
        res.status(200).json(videos[0]);
    } catch (error) {
        res.status(500).json({ message: '단일 영상 조회 실패' });
    }
});

// 생성[cite: 15]
router.post('/', async (req, res) => {
    try {
        const { worship_id, video_url, video_order } = req.body;
        const [result] = await db.query(
            'INSERT INTO worship_videos (worship_id, video_url, video_order) VALUES (?, ?, ?)', 
            [worship_id, video_url, video_order || 0]
        );
        const [newVideo] = await db.query('SELECT * FROM worship_videos WHERE id = ?', [result.insertId]);
        res.status(201).json(newVideo[0]);
    } catch (error) {
        res.status(500).json({ message: '영상 생성 실패' });
    }
});

// 수정[cite: 15]
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE worship_videos SET ${setClause} WHERE id = ?`, values);
        const [updatedVideo] = await db.query('SELECT * FROM worship_videos WHERE id = ?', [req.params.id]);
        res.status(200).json(updatedVideo[0]);
    } catch (error) {
        res.status(500).json({ message: '영상 수정 실패' });
    }
});

// 삭제[cite: 15]
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM worship_videos WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '영상 삭제 실패' });
    }
});

module.exports = router;