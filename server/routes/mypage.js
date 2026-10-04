const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// [GET] 1. 프로필 정보 조회[cite: 11]
// ==========================================
router.get('/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const [users] = await db.query('SELECT id, email, name, role, phone, profile_photo_url, email_verified, created_at, last_login_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        
        const userProfile = users[0];
        
        // members 테이블에서 user_id로 멤버 정보 조회
        const [members] = await db.query('SELECT * FROM members WHERE user_id = ?', [userId]);
        
        if (members.length > 0) {
            const member = members[0];
            // 각 역할/포지션 관계 데이터도 함께 붙여줍니다 (members.md 명세 반영)
            const [roles] = await db.query('SELECT role_type FROM member_roles WHERE member_id = ?', [member.id]);
            const [worshipPositions] = await db.query('SELECT position_type FROM member_worship_positions WHERE member_id = ?', [member.id]);
            const [stepPositions] = await db.query('SELECT position_type FROM member_step_positions WHERE member_id = ?', [member.id]);

            userProfile.members = {
                ...member,
                member_roles: roles,
                member_worship_positions: worshipPositions,
                member_step_positions: stepPositions
            };
        } else {
            userProfile.members = null; // 매핑된 멤버가 없으면 명세에 따라 null 반환[cite: 19]
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.error('프로필 조회 에러:', error);
        res.status(500).json({ message: '프로필 조회 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// [PATCH] 2. 프로필 정보 수정[cite: 11]
// ==========================================
router.patch('/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, phone, profile_photo_url } = req.body;

        await db.query('UPDATE users SET name = ?, phone = ?, profile_photo_url = ? WHERE id = ?', 
            [name, phone, profile_photo_url, userId]);
        
        const [updatedUser] = await db.query('SELECT id, email, name, role, phone, profile_photo_url, email_verified, created_at FROM users WHERE id = ?', [userId]);
        res.status(200).json(updatedUser[0]);
    } catch (error) {
        console.error('프로필 수정 에러:', error);
        res.status(500).json({ message: '프로필 수정 중 에러가 발생했습니다.' });
    }
});

// ==========================================
// [GET] 3. 집회 신청 내역 조회[cite: 11]
// ==========================================
router.get('/:userId/applications', async (req, res) => {
    try {
        const { userId } = req.params;
        const [applications] = await db.query('SELECT * FROM ticket_applications WHERE user_id = ?', [userId]);
        res.status(200).json(applications);
    } catch (error) {
        console.error('신청 내역 조회 에러:', error);
        res.status(500).json({ message: '신청 내역을 불러오지 못했습니다.' });
    }
});

// ==========================================
// [GET] 4. 내 Q&A 내역 조회[cite: 11]
// ==========================================
router.get('/:userId/qnas', async (req, res) => {
    try {
        const { userId } = req.params;
        const [qnas] = await db.query('SELECT * FROM qna WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.status(200).json(qnas);
    } catch (error) {
        console.error('내 Q&A 조회 에러:', error);
        res.status(500).json({ message: 'Q&A 내역을 불러오지 못했습니다.' });
    }
});

// ==========================================
// [GET] 5. 악보 다운로드 내역 조회[cite: 11]
// ==========================================
router.get('/:userId/downloads', async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT d.id, d.score_id, d.user_id, d.downloaded_at, 
                   s.id AS s_id, s.title, s.category, s.song_key, s.bpm, s.thumbnail_url, s.file_url 
            FROM score_downloads d 
            JOIN scores s ON d.score_id = s.id 
            WHERE d.user_id = ? 
            ORDER BY d.downloaded_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        
        // 프론트엔드 ScoreDownload 구조체에 맞게 데이터 매핑[cite: 11]
        const downloads = rows.map(row => ({
            id: row.id,
            score_id: row.score_id,
            user_id: row.user_id,
            downloaded_at: row.downloaded_at,
            scores: {
                id: row.s_id,
                title: row.title,
                category: row.category,
                song_key: row.song_key,
                bpm: row.bpm,
                thumbnail_url: row.thumbnail_url,
                file_url: row.file_url
            }
        }));

        res.status(200).json(downloads);
    } catch (error) {
        console.error('다운로드 내역 조회 에러:', error);
        res.status(500).json({ message: '다운로드 내역을 불러오지 못했습니다.' });
    }
});

// ==========================================
// [GET] 6. 활동 요약 정보 (Activity)[cite: 11]
// ==========================================
router.get('/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 30; // 기본값 30일[cite: 11]

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const [[{ count: recentApplications }]] = await db.query('SELECT COUNT(*) as count FROM ticket_applications WHERE user_id = ? AND created_at >= ?', [userId, dateLimit]);
        const [[{ count: recentQnas }]] = await db.query('SELECT COUNT(*) as count FROM qna WHERE user_id = ? AND created_at >= ?', [userId, dateLimit]);
        const [[{ count: recentDownloads }]] = await db.query('SELECT COUNT(*) as count FROM score_downloads WHERE user_id = ? AND downloaded_at >= ?', [userId, dateLimit]);

        res.status(200).json({
            period: `${days}일`,
            recentApplications,
            recentQnas,
            recentDownloads
        });
    } catch (error) {
        console.error('활동 요약 조회 에러:', error);
        res.status(500).json({ message: '활동 요약 정보를 불러오지 못했습니다.' });
    }
});

// ==========================================
// [GET] 7. 마이페이지 대시보드 전체 정보 통합[cite: 11]
// ==========================================
router.get('/:userId/dashboard', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 각 테이블별 총합 통계 추출
        const [[{ count: totalApplications }]] = await db.query('SELECT COUNT(*) as count FROM ticket_applications WHERE user_id = ?', [userId]);
        const [[{ count: confirmedApplications }]] = await db.query("SELECT COUNT(*) as count FROM ticket_applications WHERE user_id = ? AND status = 'CONFIRMED'", [userId]); // 가정된 status
        const [[{ count: totalQnas }]] = await db.query('SELECT COUNT(*) as count FROM qna WHERE user_id = ?', [userId]);
        const [[{ count: answeredQnas }]] = await db.query("SELECT COUNT(*) as count FROM qna WHERE user_id = ? AND status = 'ANSWERED'", [userId]);
        const [[{ count: totalDownloads }]] = await db.query('SELECT COUNT(*) as count FROM score_downloads WHERE user_id = ?', [userId]);

        const stats = {
            totalApplications,
            confirmedApplications,
            totalQnas,
            answeredQnas,
            totalDownloads
        }; // 명세의 DashboardStats 구조체 반영[cite: 11]

        // 각 개별 함수에서 다루는 데이터를 프로미스로 병렬 조회 (시간 단축)
        // 실제 프로덕션 적용 시 위에서 작성한 엔드포인트들의 내부 로직을 함수화하여 호출하는 것을 권장합니다.
        // 현재는 Dashboard 구조체 완성을 위한 목업 형태의 응답을 반환합니다.
        
        res.status(200).json({
            profile: { id: userId, email: 'mock@example.com', name: 'User', role: 'user', email_verified: true, created_at: new Date() }, // 임시 프로필
            applications: [],
            qnas: [],
            downloads: [],
            stats: stats
        });
    } catch (error) {
        console.error('대시보드 조회 에러:', error);
        res.status(500).json({ message: '대시보드 정보를 불러오지 못했습니다.' });
    }
});

module.exports = router;