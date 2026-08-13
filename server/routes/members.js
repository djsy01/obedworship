const express = require('express');
const router = express.Router();
const db = require('../config/db'); // 기존 DB 풀 연결 유지[cite: 2]
const multer = require('multer');

// 파일 업로드를 위한 Multer 설정 (기본 디스크 스토리지 예시)
const upload = multer({ dest: 'uploads/members/' });

/**
 * 멤버의 역할과 포지션을 가져오는 헬퍼 함수
 * 프론트엔드 인터페이스(Member) 구조에 맞게 데이터를 매핑합니다.
 */
async function getMemberRelations(memberId) {
    const [roles] = await db.query('SELECT role_type FROM member_roles WHERE member_id = ?', [memberId]);
    const [worshipPositions] = await db.query('SELECT position_type FROM member_worship_positions WHERE member_id = ?', [memberId]);
    const [stepPositions] = await db.query('SELECT position_type FROM member_step_positions WHERE member_id = ?', [memberId]);
    
    return {
        member_roles: roles,
        member_worship_positions: worshipPositions,
        member_step_positions: stepPositions
    };
}

// =================================
// 1. [GET] 멤버 목록 조회 API (Query String 필터링 포함)
// =================================
router.get('/', async (req, res) => {
    try {
        const { active, affiliation } = req.query;
        let baseQuery = 'SELECT * FROM members WHERE 1=1';
        const queryParams = [];

        if (active === 'true') {
            baseQuery += ' AND is_active = true';
        }
        if (affiliation) {
            baseQuery += ' AND affiliation = ?';
            queryParams.push(affiliation);
        }

        const [members] = await db.query(baseQuery, queryParams);

        // 프론트엔드 요구사항에 맞춰 역할/포지션 데이터를 함께 매핑
        const membersWithRelations = await Promise.all(
            members.map(async (member) => {
                const relations = await getMemberRelations(member.id);
                return { ...member, ...relations };
            })
        );

        res.status(200).json(membersWithRelations);
    } catch (error) {
        console.error('멤버 목록 조회 중 에러 발생: ', error);
        res.status(500).json({ message: '서버에서 멤버 데이터를 불러오지 못했습니다.' });
    }
});

// =================================
// 2. [GET] 단일 멤버 조회 API
// =================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [members] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
        
        if (members.length === 0) {
            return res.status(404).json({ message: '해당 멤버를 찾을 수 없습니다.' });
        }

        const relations = await getMemberRelations(id);
        const memberData = { ...members[0], ...relations };
        
        res.status(200).json(memberData);
    } catch (error) {
        console.error('단일 멤버 조회 에러: ', error);
        res.status(500).json({ message: '멤버 정보를 불러오는 중 에러가 발생했습니다.' });
    }
});

// =================================
// 3. [POST] 새 멤버 생성 API
// =================================
router.post('/', async (req, res) => {
    try {
        const { name, affiliation, user_id, photo_url, instagram_url, youtube_url, is_active, description } = req.body;
        
        const insertQuery = `
            INSERT INTO members 
            (name, affiliation, user_id, photo_url, instagram_url, youtube_url, is_active, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [name, affiliation, user_id, photo_url, instagram_url, youtube_url, is_active ?? true, description];
        
        const [result] = await db.query(insertQuery, values);
        
        // 생성된 멤버 반환
        const [newMember] = await db.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
        res.status(201).json(newMember[0]);
    } catch (error) {
        console.error('멤버 생성 에러: ', error);
        res.status(500).json({ message: '멤버 생성 중 에러가 발생했습니다.' });
    }
});

// =================================
// 4. [PATCH] 멤버 정보 수정 API
// =================================
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return res.status(400).json({ message: '수정할 데이터가 제공되지 않았습니다.' });
        }

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id); // WHERE id = ? 용도

        await db.query(`UPDATE members SET ${setClause} WHERE id = ?`, values);
        
        const [updatedMember] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
        res.status(200).json(updatedMember[0]);
    } catch (error) {
        console.error('멤버 수정 에러: ', error);
        res.status(500).json({ message: '멤버 정보를 수정하는 중 에러가 발생했습니다.' });
    }
});

// =================================
// 5. [DELETE] 멤버 삭제 API
// =================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM members WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('멤버 삭제 에러: ', error);
        res.status(500).json({ message: '멤버 삭제 중 에러가 발생했습니다.' });
    }
});

// =================================
// 6. [POST] 사진 파일 업로드 API
// =================================
router.post('/upload-photo', upload.single('photo'), (req, res) => {
    try {
        // req.file 에 업로드된 파일 정보가 담깁니다.
        // 클라우드 스토리지(S3 등)를 쓴다면 업로드 후 URL을 반환하도록 수정해야 합니다.
        if (!req.file) {
            return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
        }
        
        // 프론트엔드가 요구하는 반환 형식: { photo_url: string }
        const photoUrl = `/uploads/members/${req.file.filename}`;
        res.status(200).json({ photo_url: photoUrl });
    } catch (error) {
        console.error('사진 업로드 에러: ', error);
        res.status(500).json({ message: '사진 업로드 중 에러가 발생했습니다.' });
    }
});

// =================================
// 7. [POST] 역할(Roles) 업데이트 API
// =================================
router.post('/:id/roles', async (req, res) => {
    const { id } = req.params;
    const { roleTypes } = req.body;
    
    try {
        // 기존 역할 삭제 후 새로 삽입 (트랜잭션 없이 간단히 구현)
        await db.query('DELETE FROM member_roles WHERE member_id = ?', [id]);
        
        if (roleTypes && roleTypes.length > 0) {
            const values = roleTypes.map(role => [id, role]);
            await db.query('INSERT INTO member_roles (member_id, role_type) VALUES ?', [values]);
        }
        
        res.status(200).json({ message: '역할이 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        console.error('역할 업데이트 에러: ', error);
        res.status(500).json({ message: '역할 업데이트 중 에러가 발생했습니다.' });
    }
});

// =================================
// 8. [POST] 찬양팀(Worship) 포지션 업데이트 API
// =================================
router.post('/:id/worship-positions', async (req, res) => {
    const { id } = req.params;
    const { positionTypes } = req.body;
    
    try {
        await db.query('DELETE FROM member_worship_positions WHERE member_id = ?', [id]);
        
        if (positionTypes && positionTypes.length > 0) {
            const values = positionTypes.map(pos => [id, pos]);
            await db.query('INSERT INTO member_worship_positions (member_id, position_type) VALUES ?', [values]);
        }
        
        res.status(200).json({ message: '찬양팀 포지션이 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        console.error('찬양팀 포지션 업데이트 에러: ', error);
        res.status(500).json({ message: '찬양팀 포지션 업데이트 중 에러가 발생했습니다.' });
    }
});

// =================================
// 9. [POST] 스텝(Step) 포지션 업데이트 API
// =================================
router.post('/:id/step-positions', async (req, res) => {
    const { id } = req.params;
    const { positionTypes } = req.body;
    
    try {
        await db.query('DELETE FROM member_step_positions WHERE member_id = ?', [id]);
        
        if (positionTypes && positionTypes.length > 0) {
            const values = positionTypes.map(pos => [id, pos]);
            await db.query('INSERT INTO member_step_positions (member_id, position_type) VALUES ?', [values]);
        }
        
        res.status(200).json({ message: '스텝 포지션이 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        console.error('스텝 포지션 업데이트 에러: ', error);
        res.status(500).json({ message: '스텝 포지션 업데이트 중 에러가 발생했습니다.' });
    }
});

module.exports = router; // 외부에서 이 라우터를 쓸 수 있게 내보냅니다.[cite: 2]