const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// [GET] Q&A 전체 조회 및 카테고리 필터링[cite: 9]
// ==========================================
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM qna ORDER BY created_at DESC';
        const params = [];

        if (category) {
            query = 'SELECT * FROM qna WHERE category = ? ORDER BY created_at DESC';
            params.push(category);
        }

        const [qnas] = await db.query(query, params);
        res.status(200).json(qnas);
    } catch (error) {
        console.error('Q&A 목록 조회 에러:', error);
        res.status(500).json({ message: 'Q&A 목록을 불러오는 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// [GET] 단일 Q&A 조회[cite: 9]
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [qnas] = await db.query('SELECT * FROM qna WHERE id = ?', [id]);
        
        if (qnas.length === 0) return res.status(404).json({ message: '질문을 찾을 수 없습니다.' });
        res.status(200).json(qnas[0]);
    } catch (error) {
        console.error('Q&A 단일 조회 에러:', error);
        res.status(500).json({ message: 'Q&A 정보를 불러오는 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// [POST] 새 질문 작성[cite: 9]
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { user_id, category, title, content } = req.body;
        
        const insertQuery = `
            INSERT INTO qna (user_id, category, title, content, status) 
            VALUES (?, ?, ?, ?, 'WAITING')
        `; // 명세에 따라 생성 시 status는 'WAITING' 부여[cite: 9]
        
        const [result] = await db.query(insertQuery, [user_id, category, title, content]);
        const [newQna] = await db.query('SELECT * FROM qna WHERE id = ?', [result.insertId]);
        
        res.status(201).json(newQna[0]);
    } catch (error) {
        console.error('Q&A 작성 에러:', error);
        res.status(500).json({ message: '질문 등록 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// [PATCH] 관리자 답변 등록/수정[cite: 9]
// ==========================================
router.patch('/:id/answer', async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        const updateQuery = `
            UPDATE qna 
            SET answer = ?, status = 'ANSWERED', answer_date = CURRENT_TIMESTAMP 
            WHERE id = ?
        `; // 답변 시 status 변경 및 answer_date 기록[cite: 9]
        
        await db.query(updateQuery, [answer, id]);
        
        const [updatedQna] = await db.query('SELECT * FROM qna WHERE id = ?', [id]);
        res.status(200).json(updatedQna[0]);
    } catch (error) {
        console.error('Q&A 답변 등록 에러:', error);
        res.status(500).json({ message: '답변 등록 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// [DELETE] Q&A 삭제[cite: 9]
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM qna WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Q&A 삭제 에러:', error);
        res.status(500).json({ message: '질문 삭제 중 에러가 발생했습니다.' });
    }
});

module.exports = router;