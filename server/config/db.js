// 1.환경변수 로드
require('dotenv').config();
const mysql = require('mysql2');

// 2.DB 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10, // 동시에 유지할 연결 수
    queueLimit: 0
});

console.log('DB 모듈이 준비되었습니다.');

// 3.DB Pool Export
module.exports = pool.promise();