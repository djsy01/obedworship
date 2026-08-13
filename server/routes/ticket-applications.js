const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// [GET] 신청 내역 조회 (전체, 유저별, 티켓별)[cite: 13]
// ==========================================
router.get('/', async (req, res) => {
    try {
        const { user_id, ticket_id } = req.query;
        let query = 'SELECT * FROM ticket_applications WHERE 1=1';
        const params = [];

        if (user_id) {
            query += ' AND user_id = ?';
            params.push(user_id);
        }
        if (ticket_id) {
            query += ' AND ticket_id = ?';
            params.push(ticket_id);
        }

        query += ' ORDER BY created_at DESC';
        const [applications] = await db.query(query, params);
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: '신청 내역 조회 실패' });
    }
});

// ==========================================
// [GET] 단일 신청 내역 조회[cite: 13]
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const [apps] = await db.query('SELECT * FROM ticket_applications WHERE id = ?', [req.params.id]);
        if (apps.length === 0) return res.status(404).json({ message: '신청 내역이 없습니다.' });
        res.status(200).json(apps[0]);
    } catch (error) {
        res.status(500).json({ message: '신청 내역 조회 실패' });
    }
});

// ==========================================
// [GET] 특정 티켓의 신청 통계 조회[cite: 13]
// ==========================================
router.get('/stats/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        
        // 전체, 확정, 대기, 취소 건수를 각각 그룹화하여 조회[cite: 13]
        const query = `
            SELECT status, COUNT(*) as count 
            FROM ticket_applications 
            WHERE ticket_id = ? 
            GROUP BY status
        `;
        const [rows] = await db.query(query, [ticketId]);
        
        const stats = { total: 0, confirmed: 0, pending: 0, cancelled: 0 };[cite: 13]
        
        rows.forEach(row => {
            stats.total += row.count;
            if (row.status === 'CONFIRMED') stats.confirmed = row.count;
            if (row.status === 'PENDING') stats.pending = row.count;
            if (row.status === 'CANCELLED') stats.cancelled = row.count;
        });

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: '통계 조회 실패' });
    }
});

// ==========================================
// [POST] 새 신청서 작성[cite: 13]
// ==========================================
router.post('/', async (req, res) => {
    try {
        const data = { 
            ...req.body, 
            status: 'PENDING', 
            payment_status: 'UNPAID' // 기본값 세팅[cite: 13]
        }; 
        
        const keys = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        
        const [result] = await db.query(`INSERT INTO ticket_applications (${keys}) VALUES (${placeholders})`, Object.values(data));
        const [newApp] = await db.query('SELECT * FROM ticket_applications WHERE id = ?', [result.insertId]);
        
        res.status(201).json(newApp[0]);
    } catch (error) {
        res.status(500).json({ message: '신청서 생성 실패' });
    }
});

// ==========================================
// [PATCH] 신청서 메타데이터 수정[cite: 13]
// ==========================================
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.status(400).json({ message: '수정 데이터 없음' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE ticket_applications SET ${setClause} WHERE id = ?`, values);
        const [updatedApp] = await db.query('SELECT * FROM ticket_applications WHERE id = ?', [req.params.id]);
        
        res.status(200).json(updatedApp[0]);
    } catch (error) {
        res.status(500).json({ message: '신청서 수정 실패' });
    }
});

// ==========================================
// [PATCH] 상태(Status) 전문 변경 라우터 (취소 포함)[cite: 13]
// ==========================================
router.patch('/:id/cancel', async (req, res) => {
    try {
        await db.query(`UPDATE ticket_applications SET status = 'CANCELLED' WHERE id = ?`, [req.params.id]);
        const [app] = await db.query('SELECT * FROM ticket_applications WHERE id = ?', [req.params.id]);
        res.status(200).json(app[0]);
    } catch (error) {
        res.status(500).json({ message: '취소 처리 실패' });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'PENDING' | 'CONFIRMED' | 'CANCELLED'[cite: 13]
        await db.query(`UPDATE ticket_applications SET status = ? WHERE id = ?`, [status, req.params.id]);
        const [app] = await db.query('SELECT * FROM ticket_applications WHERE id = ?', [req.params.id]);
        res.status(200).json(app[0]);
    } catch (error) {
        res.status(500).json({ message: '상태 업데이트 실패' });
    }
});

router.patch('/:id/payment', async (req, res) => {
    try {
        const { payment_status } = req.body; // 'UNPAID' | 'PAID' | 'FREE'[cite: 13]
        await db.query(`UPDATE ticket_applications SET payment_status = ? WHERE id = ?`, [payment_status, req.params.id]);
        const [app] = await db.query('SELECT * FROM ticket_applications WHERE id = ?', [req.params.id]);
        res.status(200).json(app[0]);
    } catch (error) {
        res.status(500).json({ message: '결제 상태 업데이트 실패' });
    }
});

// ==========================================
// [DELETE] 신청서 삭제[cite: 13]
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM ticket_applications WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: '신청서 삭제 실패' });
    }
});

module.exports = router;