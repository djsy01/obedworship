# OBED Worship Homepage Back-End
> OBED Worship 홈페이지 백엔드 (Node.js + Express + MySQL)

---

## 기술 스택
| 분류      | 기술 / 라이브러리 | 버전  | 용도                                 |
| --------- | ---------------- | ----- | ----------------------------------- |
| Runtime   | Node.js          | v22.x | 백엔드 실행 환경                     |
| Framework | Express          | ^4.x  | 웹 서버 및 API 라우팅                |
| Database  | MySQL (Railway)  | 8.x   | 클라우드 관계형 데이터베이스          |
| DB Driver | mysql2           | ^3.x  | DB 연결 풀(Pool) 및 Promise 기반 쿼리 |
| Security  | cors             | ^2.x  | 교차 출처 리소스 공유 허용            |
| Config    | dotenv           | ^16.x | 환경변수 및 시크릿 키 관리            |

---

## 현재 완료 사항

### 인프라 및 아키텍처
- [x] 클라우드 DB 연동: Railway MySQL 서버 연결 완료 (createPool 기반 안정성 확보)
- [x] CORS 설정: 프론트엔드(localhost:5173)와의 통신 포트 개방
- [x] 라우터 분리 (모듈화): index.js에 집중된 코드를 도메인별(routes/)로 분리하는 아키텍처 적용

### API 개발 현황
- [x] GET /members - 전체 팀원 정보 조회 API 뚫기 완료 (프론트엔드 연동 성공)
- [] GET /worship - 집회 목록 조회 API (작업 예정)
- [] GET /assetes - 에셋 관련 API (작업 예정)
- [] Auth /Login - 프론트엔드 임시 Mock 데이터 이후 실제 JWT 인증 로직 연동 예정

---

## 실행 방법
### 패키지 설치
```bash 
npm install
```

### 환경 변수 설정
최상단(.env) 파일에 DB 접속 정보를 세팅해야 합니다. (보안상 깃허브에는 올리지 않습니다.)
```env
PORT=3000
DB_HOST=your-railway-host
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
DB_PORT=your-db-port
```
### 서버 실행
```bash
node index.js
# (추후 nodemon 도입 시 npm run dev로 변경 예정)
```
정상 실행 시 "메인 서버가 시작되었습니다! (포트: 3000)" 메시지가 출력됩니다.

---
## 프로젝트 구조
```text
server/             
┣━ config/              # 설정 파일 모음
┃  ┗━ db.js             # MySQL Connection Pool 설정 (Promise 지원)
┣━ routes/              # API 라우터 (엔드포인트 분리)
┃  ┣━ members.js        # 팀원 관련 API
┃  ┣━ worship.js        # 집회 관련 API (예정)
┃  ┗━ assets.js         # 에셋 관련 API (예정)
┣━ .env                 # 환경 변수 (Git 제외 필수)
┣━ index.js             # Express 메인 애플리케이션 (진입점)
┣━ package.json         # 의존성 관리
┗━ README.md            # 백엔드 명세서
```

---

(이 문서는 백엔드 API가 추가될 때마다 지속적으로 업데이트됩니다.)