// 1.Env Variable and Modul Load
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// ====================================
// 2.공통 미들웨어 (Middleware)
// ====================================
app.use(cors()); // 프론트엔드의 접근 허용 (CORS 에러 방지)
app.use(express.json()); // 프론트엔드가 보내는 JSON 데이터를 읽을 수 있게 변환

// ====================================
// 3.라우터 연결 (Routes) - 백엔드의 '교차로'
// ====================================
// 방금 만든 members 라우터를 불러옵니다.
const membersRouter = require('./routes/members');

// 프론트엔드가 '/members'로 시작하는 주소를 요청하면, membersRouter 파일로 안내합니다.
app.use('/members', membersRouter);

// ====================================
// 4.Server Health Check
// ====================================
app.get('/', (req, res) => {
    res.send('OBED Worship 백엔드 서버가 정상 작동 중입니다! (Port: 3000)');
});

// ====================================
// 5.Server Start
// ====================================
app.listen(port, () => {
    console.log(`메인 서버가 시작되었습니다! (Port: ${port})`);
    console.log(`대기 중인 주소: http://localhost:$${port}/members`);
});