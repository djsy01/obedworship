const express = require('express');
const router = express.Router();
// Connect DB Pool
const db = require('../config/db');

// =================================
// [GET] 전체 멤버 목록 조회 API
// 프론트엔드의 'memberApi.getALL()' 요청을 여기서 받습니다.
// =================================
router.get('/', async (req, res) => {
    try {
        // 1.DB에서 members 테이블의 모든 데이터를 가져옵니다.
        const [members] = await db.query('SELECT * FROM members');

        // 2.데이터를 프론트엔드에 쏴줍니다. (상태 코드 200은 '성공'을 의미)
        res.status(200).json(members);

        console.log(`프론트엔드에 ${members.length}명의 멤버 데이터를 전송했습니다.`);
    }catch(error) {
        console.error('멤버 목록 조회 중 에러 발생: ', error);
        res.status(500).json({message: '서버에서 멤버 데이터를 불러오지 못했습니다.'});
    }
});

// 외부에서 이 라우터를 쓸 수 있게 내보냅니다.
module.exports = router;