# OBED Worship Homepage Back-End
> OBED Worship 홈페이지 백엔드 (Node.js + Express + MySQL)

---

## 기술 스택
| 분류      | 기술 / 라이브러리 | 버전  | 용도                                 |
| --------- | ---------------- | ----- | ----------------------------------- |
| Runtime   | Node.js          | 22.x / 24.x | 백엔드 실행 환경                     |
| Framework | Express          | ^5.x  | 웹 서버 및 API 라우팅                |
| Database  | MySQL (OCI)  | 8.x   | 클라우드 관계형 데이터베이스          |
| DB Driver | mysql2           | ^3.x  | DB 연결 풀(Pool) 및 Promise 기반 쿼리 |
| Security  | cors             | ^2.x  | 교차 출처 리소스 공유 허용            |
| Config    | dotenv           | ^17.x | 환경변수 및 시크릿 키 관리            |

---

## 현재 완료 사항

### 인프라 및 아키텍처
- [x] 클라우드 DB 연동: OCI MySQL 서버 연결 (createPool 기반 안정성 확보)
- [x] CORS 설정: 프론트엔드(localhost:5173)와의 통신 포트 개방
- [x] 라우터 분리 (모듈화): app.js에서 연결하는 라우트를 도메인별(routes/)로 분리하는 아키텍처 적용

### API 개발 현황
- [x] GET /members - 전체 팀원 정보 조회 API 뚫기 완료 (프론트엔드 연동 성공)
- [x] GET /worship - 집회 목록 조회 API
- [x] GET /assets - 에셋 조회 API
- [x] POST /auth/login - JWT 로그인

---

## 실행 방법
### 패키지 설치
```bash 
npm ci
```

### 환경 변수 설정
최상단(.env) 파일에 DB 접속 정보를 세팅해야 합니다. (보안상 깃허브에는 올리지 않습니다.)
```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
DB_PORT=3306
JWT_SECRET=your-jwt-secret
```
### Node.js 서버 실행
`server/`에서 실행합니다. `npm start`는 `node app.js`를 호출합니다.
```bash
npm start
```
기본 포트는 3000이며 루트 경로에서 서버 상태를 확인할 수 있습니다. 새 개발용 MySQL에는 [추적된 SQL 스키마](../database/MySQL.md)의 CREATE 문을 순서대로 적용합니다.

---
## 테스트

`npm --prefix server test`는 미인증 요청과 Q&A 공개 범위를 검사합니다. GitHub Actions는 격리된 MySQL 8.0을 실행하고 [개발 스키마](../database/MySQL.md)의 CREATE 문을 적용한 뒤 네 계정 역할, 본인 프로필, 세션 무효화, 업로드와 파일 열람을 검증합니다.

로컬에서 같은 통합 테스트를 실행하려면 별도 테스트 DB를 로컬 포트에 연결합니다. 테스트는 `obed_worship` DB에 합성 계정과 파일을 생성합니다. 테스트 전용 계정은 `obed_test`, 비밀번호는 `local-test-db`입니다. `OBED_TEST_DB_PORT`에 해당 포트를 지정해 `npm --prefix server test`를 실행합니다.

## 프로젝트 구조
```text
server/             
┣━ config/              # 설정 파일 모음
┃  ┗━ db.js             # MySQL Connection Pool 설정 (Promise 지원)
┣━ routes/              # API 라우터 (엔드포인트 분리)
┃  ┣━ members.js        # 팀원 관련 API
┃  ┣━ worship.js        # 집회 관련 API
┃  ┗━ assets.js         # 에셋 관련 API
┣━ .env                 # 환경 변수 (Git 제외 필수)
┣━ app.js               # Express 진입점
┣━ package.json         # 의존성 관리
┗━ README.md            # 백엔드 명세서
```

---

(이 문서는 백엔드 API가 추가될 때마다 지속적으로 업데이트됩니다.)

## 보안 변경 배포

- 서버와 클라이언트를 함께 배포합니다. 이메일 코드 확인 API는 `verificationToken`을 반환하며, 회원가입과 재설정 요청에서 이 값을 보내야 합니다.
- 이번 변경 이후 이전 로그인 토큰은 만료 처리됩니다. 비밀번호 변경이나 재설정 후에도 다시 로그인해야 합니다. 이메일 코드는 현재 단일 프로세스 메모리에 보관하므로 코드 확인과 완료 요청이 같은 프로세스에 도달해야 합니다.
- 사진은 파일당 8 MiB, 여러 장 업로드는 한 요청에 5장까지 받습니다. 일반 악보 PDF는 10 MiB, 관리자 에셋은 150 MiB까지 받습니다. 대형 파일을 사용하는 환경에서는 Nginx 요청 본문 제한과 MySQL `max_allowed_packet`이 실제 파일과 부가 데이터를 수용하는지 확인합니다.
- 운영 MySQL에서 `users.role`에 `operator`가 있는지, `worship_logs.poster_url`과 `users.profile_photo_url`이 있는지 확인합니다. 누락된 변경만 스키마 문서를 기준으로 적용합니다.
- 운영의 JWT 비밀값은 배포 담당자가 확인하고, 공개된 폴백을 사용했거나 사용 이력이 불분명하면 새 비밀값으로 교체합니다.
- 기존 `/files/` 공유 캐시는 배포 시 비웁니다. 공개 미디어의 조건부 요청은 권한을 매번 확인합니다. 인증 응답은 `private, no-store`를 적용합니다. 큰 파일은 4 MiB 단위로 전송하며 단일 바이트 범위 요청을 지원합니다.
- SVG는 최대 8 MiB의 UTF-8 정적 문서로 검증합니다. 기존 SVG 자산을 점검하고 외부 참조나 스크립트가 포함된 파일은 정적 SVG 또는 래스터 이미지로 교체합니다. 사이트 외부의 파일 URL에는 해당 저장소의 공개 정책이 적용됩니다.
- 에셋 파일을 교체하거나 삭제하면 현재 DB 레코드의 참조가 모두 끊긴 해당 파일만 회수합니다. 이전에 쌓인 미참조 파일은 일괄 정리하지 않습니다.
