const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// [GET] 티켓 목록 전체 조회 (status, year 필터링)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const { status, year } = req.query;
        let query = 'SELECT * FROM tickets WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (year) {
            query += ' AND year = ?';
            params.push(year);
        }

        query += ' ORDER BY created_at DESC';
        const [tickets] = await db.query(query, params);
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: '티켓 목록 조회 실패' });
    }
});

// ==========================================
// [GET] 단일 티켓 조회[cite: 13]
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const [tickets] = await db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
        if (tickets.length === 0) return res.status(404).json({ message: '티켓을 찾을 수 없습니다.' });
        res.status(200).json(tickets[0]);
    } catch (error) {
        res.status(500).json({ message: '티켓 조회 실패' });
    }
});

// ==========================================
// [POST] 새 티켓 생성[cite: 13]
// ==========================================
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        const keys = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        
        const [result] = await db.query(`INSERT INTO tickets (${keys}) VALUES (${placeholders})`, Object.values(data));
        const [newTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
        
        res.status(201).json(newTicket[0]);
    } catch (error) {
        res.status(500).json({ message: '티켓 생성 실패' });
    }
});

// ==========================================
// [PATCH] 티켓 상태(마감, 취소) 및 정보 수정[cite: 13]
// ==========================================
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body; // status: 'CLOSED', 'CANCELED' 등 포함[cite: 13]
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE tickets SET ${setClause} WHERE id = ?`, values);
        const [updatedTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
        
        res.status(200).json(updatedTicket[0]);
    } catch (error) {
        res.status(500).json({ message: '티켓 수정 실패' });
    }
});

// ==========================================
// [DELETE] 티켓 삭제[cite: 13]
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '티켓 삭제 실패' });
    }
});

// ==========================================
// [POST] 예배(worship_logs) 연동으로 티켓 자동 생성[cite: 13]
// ==========================================
router.post('/from-worship', async (req, res) => {
    try {
        const { worship_id, ...restData } = req.body;
        
        // 기존 worship_logs에서 데이터 가져오기
        const [worships] = await db.query('SELECT title, date, year, location, preacher, poster_url FROM worship_logs WHERE id = ?', [worship_id]);
        if (worships.length === 0) return res.status(404).json({ message: '연동할 예배 정보가 없습니다.' });
        
        const w = worships[0];
        const ticketData = {
            worship_id,
            title: w.title,
            date: w.date,
            year: w.year,
            place: w.location,
            preacher: w.preacher,
            poster_url: w.poster_url,
            status: 'OPEN', // 기본 상태[cite: 13]
            ...restData
        };

        const keys = Object.keys(ticketData).join(', ');
        const placeholders = Object.keys(ticketData).map(() => '?').join(', ');
        
        const [result] = await db.query(`INSERT INTO tickets (${keys}) VALUES (${placeholders})`, Object.values(ticketData));
        const [newTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
        
        res.status(201).json(newTicket[0]);
    } catch (error) {
        res.status(500).json({ message: '예배 연동 티켓 생성 실패' });
    }
});

module.exports = router;