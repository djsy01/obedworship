// ====================================
// 1. 환경 변수 및 모듈 로드
// ====================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// ====================================
// 2. 공통 미들웨어 (Middleware)
// ====================================
// 프론트엔드의 접근 허용 (CORS 에러 방지)
app.use(cors({
    origin: 'http://localhost:5173', // 프론트엔드 Vue(Vite) 로컬 개발 주소
    credentials: true // JWT 토큰 및 쿠키를 주고받기 위해 필수
})); 

// 클라이언트가 보내는 JSON 및 URL-encoded 데이터를 파싱
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// (참고: JWT 방식을 사용하므로 기존 express-session 설정은 삭제되었습니다.)

// ====================================
// 3. 라우터 연결 (Routes)
// ====================================
// 3-1. 핵심 도메인 라우터
app.use('/auth', require('./routes/auth'));           // 회원가입, 로그인(JWT), 비밀번호 관리
app.use('/members', require('./routes/members'));     // 멤버 CRUD 및 사진 업로드
app.use('/assets', require('./routes/assets'));       // 정적 자산(로고 등) 관리
app.use('/worship', require('./routes/worship'));     // 예배 기본 정보 관리
app.use('/qna', require('./routes/qna'));             // Q&A 게시판 관리
app.use('/mypage', require('./routes/mypage'));       // 마이페이지 대시보드 및 내역

// 3-2. 악보 및 집회 신청(티켓) 라우터
app.use('/scores', require('./routes/scores'));       // 전체 악보 관리 및 다운로드
app.use('/tickets', require('./routes/tickets'));     // 집회 신청용 티켓(행사) 관리
app.use('/ticket-applications', require('./routes/ticket-applications')); // 유저의 티켓 신청 내역 관리

// 3-3. 특정 예배(worship_logs) 종속 미디어 라우터
app.use('/worship-videos', require('./routes/worship-videos')); 
app.use('/worship-scores', require('./routes/worship-scores')); 
app.use('/worship-songs', require('./routes/worship-songs')); 

// 🚨 worship-photos의 경우 프론트엔드 명세에 따라 두 가지 엔드포인트를 모두 지원하도록 매핑
app.use('/worship-photos', require('./routes/worship-photos')); // 일반 CRUD 용
app.use('/photos', require('./routes/worship-photos'));         // /photos/upload 업로드 통신용

// ====================================
// 4. Server Health Check (서버 상태 확인용)
// ====================================
app.get('/', (req, res) => {
    res.send('OBED Worship 백엔드 서버가 정상 작동 중입니다! (Port: ' + port + ')');
});

// ====================================
// 5. Server Start
// ====================================
app.listen(port, () => {
    console.log(`=================================`);
    console.log(`🚀 OBED Worship 메인 서버 시작됨`);
    console.log(`=================================`);
    console.log(`▶ Port: ${port}`);
    console.log(`▶ 대기 중인 주소: http://localhost:${port}`);
    console.log(`=================================`);
});