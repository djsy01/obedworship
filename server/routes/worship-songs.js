const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 전체 조회[cite: 18]
router.get('/', async (req, res) => {
    try {
        const [songs] = await db.query('SELECT * FROM worship_songs ORDER BY song_order ASC');
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: '곡 목록 조회 실패' });
    }
});

// 특정 집회(worship_id)의 곡 목록 조회[cite: 18]
router.get('/worship/:worshipId', async (req, res) => {
    try {
        const [songs] = await db.query('SELECT * FROM worship_songs WHERE worship_id = ? ORDER BY song_order ASC', [req.params.worshipId]);
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: '집회 곡 조회 실패' });
    }
});

// 단일 곡 조회[cite: 18]
router.get('/:id', async (req, res) => {
    try {
        const [songs] = await db.query('SELECT * FROM worship_songs WHERE id = ?', [req.params.id]);
        if (songs.length === 0) return res.status(404).json({ message: '곡을 찾을 수 없습니다.' });
        res.status(200).json(songs[0]);
    } catch (error) {
        res.status(500).json({ message: '단일 곡 조회 실패' });
    }
});

// 생성[cite: 18]
router.post('/', async (req, res) => {
    try {
        const { worship_id, category, song_order, song_name } = req.body;
        const [result] = await db.query(
            'INSERT INTO worship_songs (worship_id, category, song_order, song_name) VALUES (?, ?, ?, ?)', 
            [worship_id, category, song_order, song_name]
        );
        const [newSong] = await db.query('SELECT * FROM worship_songs WHERE id = ?', [result.insertId]);
        res.status(201).json(newSong[0]);
    } catch (error) {
        res.status(500).json({ message: '곡 생성 실패' });
    }
});

// 수정[cite: 18]
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE worship_songs SET ${setClause} WHERE id = ?`, values);
        const [updatedSong] = await db.query('SELECT * FROM worship_songs WHERE id = ?', [req.params.id]);
        res.status(200).json(updatedSong[0]);
    } catch (error) {
        res.status(500).json({ message: '곡 수정 실패' });
    }
});

// 삭제[cite: 18]
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM worship_songs WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '곡 삭제 실패' });
    }
});

module.exports = router;