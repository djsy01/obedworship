const express = require('express');
const router = express.Router();
const db = require('../config/db'); //[cite: 5]

/**
 * 배열 데이터를 DB 저장을 위해 JSON 문자열로 변환
 */
const safeStringify = (data) => Array.isArray(data) ? JSON.stringify(data) : data;

/**
 * DB에서 꺼낸 JSON 문자열을 프론트엔드를 위해 다시 배열로 변환
 */
const safeParse = (data) => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch(e) { return data; }
    }
    return data || [];
};

/**
 * DB 레코드를 프론트엔드 인터페이스(Worship)에 맞게 포맷팅
 */
const formatWorshipRecord = (record) => ({
    ...record,
    opening_songs: safeParse(record.opening_songs),
    celebration_songs: safeParse(record.celebration_songs),
    excluded_songs: safeParse(record.excluded_songs),
    application_enabled: Boolean(record.application_enabled)
});

// ==================================================
// 1. [GET] 전체 예배 목록 조회 API (전체 & 연도별 필터링)[cite: 4]
// ==================================================
router.get('/', async (req, res) => {
    try {
        const { year } = req.query; //[cite: 5]

        // 기본 쿼리: 전체 데이터를 최신 날짜순(DESC)으로 가져옴[cite: 5]
        let query = 'SELECT * FROM worship_logs ORDER BY date DESC'; //[cite: 5]
        let params = []; //[cite: 5]

        // 연도 필터링 조건 추가[cite: 5]
        if (year) { //[cite: 5]
            query = 'SELECT * FROM worship_logs WHERE year = ? ORDER BY date DESC'; //[cite: 5]
            params = [year]; //[cite: 5]
        }

        // DB에 쿼리 전송[cite: 5]
        const [worships] = await db.query(query, params); //[cite: 5]
        
        // 배열 데이터 파싱 처리 후 전송
        const formattedWorships = worships.map(formatWorshipRecord);
        res.status(200).json(formattedWorships); //[cite: 5]

        console.log(`프론트엔드에 ${worships.length}개의 예배 데이터를 전송했습니다. (필터: ${year || '전체'})`); //[cite: 5]
    } catch (error) {
        console.error('예배 목록 조회 중 에러 발생:', error); //[cite: 5]
        res.status(500).json({message: '서버에서 예배 데이터를 불러오지 못했습니다.'}); //[cite: 5]
    }
});

// ==================================================
// 2. [GET] 단일 예배 조회 API[cite: 4]
// ==================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [worships] = await db.query('SELECT * FROM worship_logs WHERE id = ?', [id]);

        if (worships.length === 0) {
            return res.status(404).json({ message: '해당 예배를 찾을 수 없습니다.' });
        }

        res.status(200).json(formatWorshipRecord(worships[0]));
    } catch (error) {
        console.error('예배 단일 조회 에러:', error);
        res.status(500).json({ message: '예배 정보를 불러오는 중 에러가 발생했습니다.' });
    }
});

// ==================================================
// 3. [POST] 새 예배 생성 API[cite: 4]
// ==================================================
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        
        // 배열 필드들을 JSON 문자열로 변환
        if (data.opening_songs) data.opening_songs = safeStringify(data.opening_songs);
        if (data.celebration_songs) data.celebration_songs = safeStringify(data.celebration_songs);
        if (data.excluded_songs) data.excluded_songs = safeStringify(data.excluded_songs);

        const keys = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const insertQuery = `INSERT INTO worship_logs (${keys}) VALUES (${placeholders})`;
        const [result] = await db.query(insertQuery, values);
        
        const [newWorship] = await db.query('SELECT * FROM worship_logs WHERE id = ?', [result.insertId]);
        res.status(201).json(formatWorshipRecord(newWorship[0]));
    } catch (error) {
        console.error('예배 생성 에러:', error);
        res.status(500).json({ message: '예배 생성 중 에러가 발생했습니다.' });
    }
});

// ==================================================
// 4. [PATCH] 예배 정보 수정 API[cite: 4]
// ==================================================
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return res.status(400).json({ message: '수정할 데이터가 제공되지 않았습니다.' });
        }

        // 배열 필드들을 JSON 문자열로 변환
        if (updates.opening_songs) updates.opening_songs = safeStringify(updates.opening_songs);
        if (updates.celebration_songs) updates.celebration_songs = safeStringify(updates.celebration_songs);
        if (updates.excluded_songs) updates.excluded_songs = safeStringify(updates.excluded_songs);

        const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await db.query(`UPDATE worship_logs SET ${setClause} WHERE id = ?`, values);
        
        const [updatedWorship] = await db.query('SELECT * FROM worship_logs WHERE id = ?', [id]);
        res.status(200).json(formatWorshipRecord(updatedWorship[0]));
    } catch (error) {
        console.error('예배 수정 에러:', error);
        res.status(500).json({ message: '예배 정보를 수정하는 중 에러가 발생했습니다.' });
    }
});

// ==================================================
// 5. [DELETE] 예배 삭제 API[cite: 4]
// ==================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM worship_logs WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('예배 삭제 에러:', error);
        res.status(500).json({ message: '예배 삭제 중 에러가 발생했습니다.' });
    }
});

module.exports = router; //[cite: 5]