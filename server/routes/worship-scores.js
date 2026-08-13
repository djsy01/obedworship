const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 전체 조회[cite: 17]
router.get('/', async (req, res) => {
    try {
        const [scores] = await db.query('SELECT * FROM worship_scores ORDER BY created_at DESC');
        res.status(200).json(scores);
    } catch (error) {
        res.status(500).json({ message: '악보 목록 조회 실패' });
    }
});

// 특정 집회(worship_id)의 악보 목록 조회[cite: 17]
router.get('/worship/:worshipId', async (req, res) => {
    try {
        const [scores] = await db.query('SELECT * FROM worship_scores WHERE worship_id = ? ORDER BY created_at DESC', [req.params.worshipId]);
        res.status(200).json(scores);
    } catch (error) {
        res.status(500).json({ message: '집회 악보 조회 실패' });
    }
});

// 단일 악보 조회[cite: 17]
router.get('/:id', async (req, res) => {
    try {
        const [scores] = await db.query('SELECT * FROM worship_scores WHERE id = ?', [req.params.id]);
        if (scores.length === 0) return res.status(404).json({ message: '악보를 찾을 수 없습니다.' });
        res.status(200).json(scores[0]);
    } catch (error) {
        res.status(500).json({ message: '단일 악보 조회 실패' });
    }
});

// 생성[cite: 17]
router.post('/', async (req, res) => {
    try {
        const { worship_id, filename, file_url, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO worship_scores (worship_id, filename, file_url, description) VALUES (?, ?, ?, ?)', 
            [worship_id, filename, file_url, description || null]
        );
        const [newScore] = await db.query('SELECT * FROM worship_scores WHERE id = ?', [result.insertId]);
        res.status(201).json(newScore[0]);
    } catch (error) {
        res.status(500).json({ message: '악보 연결 생성 실패' });
    }
});

// 수정[cite: 17]
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE worship_scores SET ${setClause} WHERE id = ?`, values);
        const [updatedScore] = await db.query('SELECT * FROM worship_scores WHERE id = ?', [req.params.id]);
        res.status(200).json(updatedScore[0]);
    } catch (error) {
        res.status(500).json({ message: '악보 연결 수정 실패' });
    }
});

// 삭제[cite: 17]
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM worship_scores WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '악보 연결 삭제 실패' });
    }
});

module.exports = router;