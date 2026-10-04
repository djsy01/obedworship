# Auth API

> **미구현.** `test-server/src/auth/`의 `auth.controller.ts`, `auth.service.ts`, `auth.dto.ts`, `auth.module.ts`는 모두 빈 파일이며, `app.module.ts`에도 등록되어 있지 않습니다. 아래는 프론트엔드 `client/src/api/auth.ts`에 이미 작성된 **클라이언트 기준 설계안**이며, 실제 호출 시 404가 발생합니다. 백엔드 구현 시 이 문서를 실제 스펙으로 갱신해야 합니다. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

다른 도메인 API와 달리 모든 응답이 `{ success, message, data }` 래퍼를 사용하도록 설계되어 있습니다(다른 엔드포인트는 결과를 그대로 반환).

---

## 회원가입

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "email": "hong@example.com",
        "password": "P@ssw0rd!",
        "name": "홍길동",
        "phone": "010-1234-5678"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/auth/register |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| email | String | 필수 | 이메일 |
| password | String | 필수 | 비밀번호 |
| name | String | 필수 | 이름 |
| phone | String | 선택 | 전화번호 |

### Response

#### Response Syntax

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "email": "hong@example.com",
    "name": "홍길동",
    "role": "user",
    "phone": "010-1234-5678",
    "is_active": true,
    "email_verified": false
  }
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| message | String | 필수 | 결과 메시지 |
| data | Object | 선택 | 생성된 사용자 정보 |
| data.id | Integer | 필수 | 사용자 고유 번호 |
| data.email | String | 필수 | 이메일 |
| data.name | String | 필수 | 이름 |
| data.role | String | 필수 | `admin` \| `member` \| `user` |
| data.phone | String | 선택 | 전화번호 |
| data.is_active | Boolean | 필수 | 활성 여부 |
| data.email_verified | Boolean | 필수 | 이메일 인증 여부 |

---

## 로그인

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
        "email": "hong@example.com",
        "password": "P@ssw0rd!"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/auth/login |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| email | String | 필수 | 이메일 |
| password | String | 필수 | 비밀번호 |

### Response

#### Response Syntax

```json
{
  "success": true,
  "message": "로그인되었습니다.",
  "data": {
    "id": 1,
    "email": "hong@example.com",
    "name": "홍길동",
    "role": "member",
    "phone": "010-1234-5678",
    "is_active": true,
    "email_verified": true,
    "last_login_at": "2026-08-13T12:00:00.000Z"
  }
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| message | String | 필수 | 결과 메시지 |
| data | Object | 선택 | 로그인한 사용자 정보 (User, [users.md](./users.md) 참고) |

---

## 로그아웃

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/auth/logout
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/auth/logout |

### Request Header

없음 (Body 없음)

### Response

#### Response Syntax

```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| message | String | 필수 | 결과 메시지 |

---

## 현재 로그인 사용자 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/auth/me
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/auth/me |

### Request Header

없음

### Response

#### Response Syntax

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "hong@example.com",
    "name": "홍길동",
    "role": "member",
    "phone": "010-1234-5678",
    "is_active": true,
    "email_verified": true
  }
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| data | Object | 필수 | 로그인한 사용자 정보 (User, [users.md](./users.md) 참고) |

---

## 세션 확인

로그인 상태를 확인합니다.

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/auth/session
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/auth/session |

### Request Header

없음

### Response

#### Response Syntax

```json
{
  "success": true,
  "authenticated": true,
  "data": {
    "userId": 1,
    "email": "hong@example.com",
    "role": "member",
    "name": "홍길동"
  }
}
```

비로그인 상태 예시:

```json
{
  "success": true,
  "authenticated": false,
  "data": null
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| authenticated | Boolean | 필수 | 로그인 여부 |
| data | Object | 선택 | 비로그인 시 `null` |
| data.userId | Integer | 필수 | 사용자 고유 번호 |
| data.email | String | 필수 | 이메일 |
| data.role | String | 필수 | `admin` \| `member` \| `user` |
| data.name | String | 필수 | 이름 |

---

## 비밀번호 변경

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
        "currentPassword": "OldP@ss1",
        "newPassword": "NewP@ss1"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/auth/change-password |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| currentPassword | String | 필수 | 현재 비밀번호 |
| newPassword | String | 필수 | 새 비밀번호 |

### Response

#### Response Syntax

```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| message | String | 필수 | 결과 메시지 |

---

## 비밀번호 재설정 요청

가입한 이메일로 재설정 링크(토큰)를 발송합니다.

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "hong@example.com" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/auth/forgot-password |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| email | String | 필수 | 가입한 이메일 |

### Response

#### Response Syntax

```json
{
  "success": true,
  "message": "재설정 이메일을 발송했습니다."
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| message | String | 필수 | 결과 메시지 |

---

## 비밀번호 재설정

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
        "email": "hong@example.com",
        "resetToken": "abc123",
        "newPassword": "NewP@ss1"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/auth/reset-password |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| email | String | 필수 | 이메일 |
| resetToken | String | 필수 | 발송받은 재설정 토큰 |
| newPassword | String | 필수 | 새 비밀번호 |

### Response

#### Response Syntax

```json
{
  "success": true,
  "message": "비밀번호가 재설정되었습니다."
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| success | Boolean | 필수 | 성공 여부 |
| message | String | 필수 | 결과 메시지 |

---

## 참고: users API와의 관계

현재 백엔드에는 `GET /users?email=...`(이메일로 사용자 조회, [users.md](./users.md))만 구현되어 있습니다. `members.user_id`로 회원(member)과 사용자(user)를 매핑하는 구조이므로, 로그인 구현 시 `users` 테이블과 `auth` 세션/토큰 발급 로직을 연결해야 합니다.
