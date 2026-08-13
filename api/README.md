# OBED Worship API 명세서

`test-server`(NestJS)에 실제 구현된 엔드포인트를 기준으로 작성되었습니다.
(`server/`는 초기 Express 버전으로, 현재는 사용되지 않는 구버전입니다.)

## 기본 정보

- **Base URL**: `http://localhost:3000` (로컬 개발), 배포 시 Railway 도메인
- **CORS**: `http://localhost:5173` (Vite 개발 서버)만 허용 (`credentials: true`)
- **Content-Type**: `application/json` (파일 업로드는 `multipart/form-data`)
- **정적 파일**: `/uploads/**` 경로로 업로드된 파일 서빙

## 공통 규칙

- 모든 컨트롤러는 `@Controller('경로')` 하위에 라우트가 직접 매핑되며, 전역 API 프리픽스(`/api` 등)는 없습니다.
- 응답은 별도의 래퍼(`{ success, data }` 등) 없이 서비스 결과(객체 또는 배열)를 **그대로** 반환합니다.
  - 예외: `client/src/api/auth.ts`는 `{ success, data }` 형태를 기대하고 있으나, 이는 **백엔드 미구현 상태의 설계안**입니다. [auth.md](./auth.md) 참고.
- 요청 바디는 전역 `ValidationPipe({ transform: true, whitelist: true })`로 검증됩니다.
  - DTO에 정의되지 않은 필드는 자동으로 제거됩니다.
  - 검증 실패 시 `400 Bad Request`, 형식: `{ statusCode: 400, message: string[], error: "Bad Request" }`
- ID 파라미터(`:id`)는 문자열로 받아 컨트롤러에서 숫자로 변환합니다(`+id` 또는 `parseInt`). 숫자가 아닌 값을 넘기면 `NaN`으로 처리되어 조회 실패로 이어질 수 있습니다.
- 리소스를 찾지 못하면 서비스단에서 `NotFoundException` 등을 던지는 경우 `404`가 반환됩니다(모든 서비스가 일관되게 처리하지는 않으므로 도메인별 문서에서 예외를 명시합니다).

## 인증 상태 (중요)

- 현재 `test-server`에는 **인증 가드(Guard)가 어떤 컨트롤러에도 적용되어 있지 않습니다.** 모든 엔드포인트가 인증 없이 호출 가능한 상태입니다.
- `auth` 모듈(`auth.controller.ts`, `auth.service.ts`, `auth.dto.ts`)은 파일만 존재하고 **내용이 비어 있어 미구현** 상태입니다. 실제 로그인/세션 체크 API는 없습니다.
- 프론트엔드는 `useAuth()` composable로 화면 단에서만 관리자 여부(`isAdmin`)를 제어하고 있으며, 이는 서버 측 인가와 무관합니다. **실배포 전 서버 인증/인가 구현이 필요합니다.**
- 각 문서에서 "인증 필요"로 표기한 항목은 프론트엔드 기준 관리자 전용 화면에서만 호출되는 엔드포인트를 의미하며, 서버에서 실제로 막고 있지는 않습니다.
- 위와 같은 이유로 아래 표기 규칙의 `Authorization` 헤더는 **현재는 실제로 검사되지 않습니다.** 인증 구현 후 값이 채워질 자리로, 지금은 요청 예시에서 생략합니다.

## 표기 규칙

모든 도메인 문서는 아래 형식을 따릅니다.

- `{SERVER_URL}`은 Base URL(`http://localhost:3000` 등)을 의미하는 플레이스홀더입니다.
- **Request Syntax**: 실제 호출 가능한 `curl` 예시
- **메서드 / 요청 URL** 표
- **Request Header**: 필요한 헤더 (JSON 요청은 `Content-Type: application/json`, 파일 업로드는 `multipart/form-data`)
- **Path Parameters** / **Query Parameters** / **Request Elements**(body): 있는 것만 표기
- **Response Syntax**: 실제 응답 형태에 가까운 JSON 예시
- **Response Elements**: 응답 필드 표 (필수여부는 DB 컬럼 기준 `NOT NULL` 여부 — nullable 컬럼은 "선택"으로 표기하며 값이 없으면 `null`로 내려옵니다)
- 배열을 반환하는 목록 조회 API는 Response Syntax에 단일 객체 예시를 든 뒤 `[ {...}, {...} ]` 형태로 감싸 반환된다고 표기합니다.

## 도메인별 문서

| 문서 | 대상 컨트롤러 | 설명 |
| --- | --- | --- |
| [auth.md](./auth.md) | `auth` (미구현) | 회원가입/로그인/세션 (설계만 존재) |
| [users.md](./users.md) | `users` | 이메일로 사용자 조회 (member ↔ user 매핑용) |
| [members.md](./members.md) | `members`, `member-roles`, `member-teams`, `member-worship-positions`, `member-step-positions` | 팀원 정보 및 직책/포지션 |
| [worship.md](./worship.md) | `worship` | 집회(예배) 기록 CRUD |
| [worship-media.md](./worship-media.md) | `worship-photos`, `worship-scores`, `worship-songs`, `worship-videos` | 집회 상세 하위 리소스 (사진/악보/찬양/영상) |
| [assets.md](./assets.md) | `assets` | 사이트 전역 정적 자산 (Hero 이미지 등 key-value 관리) |
| [qna.md](./qna.md) | `qna` | Q&A 게시판 |
| [scores.md](./scores.md) | `scores` | 악보 라이브러리 (worship-scores와 별개) |
| [tickets.md](./tickets.md) | `tickets`, `ticket-applications` | 집회 티켓 및 신청 |
| [mypage.md](./mypage.md) | `mypage` | 마이페이지 대시보드/프로필 |
| [photos.md](./photos.md) | `photos` | 범용 이미지 업로드 (로컬 디스크 저장) |

## 실배포 대상 페이지와의 관계

`plan.md` 기준 실배포 페이지(Home, Vision, WorshipLog, WorshipDetail, Map)는 아래 API에 의존합니다.

- Home: `assets` (`home_team_photo` 등)
- Vision: `members`, `member-roles`, `member-teams`, `member-worship-positions`, `member-step-positions`
- WorshipLog / WorshipDetail: `worship`, `worship-photos`, `worship-scores`, `worship-songs`, `worship-videos`, `assets`(포스터 등)
- Map: 별도 API 없음 (Google Maps 임베드 정적 링크)

`scores`, `tickets`/`ticket-applications`, `qna`, `mypage`, `users`, `auth`는 비배포 페이지(Scores, Tickets, Qna, MyPage) 및 향후 로그인 기능을 위해 존재합니다.
