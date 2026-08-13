# Users API

`users` 테이블(로그인 계정)을 조회하는 최소한의 엔드포인트만 존재합니다. 회원가입/로그인 자체는 [auth.md](./auth.md) 참고(미구현). 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 이메일로 사용자 조회

member(팀원)와 user(로그인 계정)를 이메일 기준으로 매핑할 때 사용됩니다. `password_hash`는 응답에서 항상 제외됩니다.

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/users?email=hong@example.com"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/users?email={email} |

### Request Header

없음

### Query Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| email | String | 필수 | 조회할 이메일 |

### Response

#### Response Syntax

```json
{
  "id": 1,
  "email": "hong@example.com",
  "name": "홍길동",
  "role": "member",
  "phone": "010-1234-5678",
  "profile_photo_url": null,
  "is_active": true,
  "email_verified": true
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 사용자 고유 번호 |
| email | String | 필수 | 이메일 |
| name | String | 필수 | 이름 |
| role | String | 필수 | `admin` \| `operator` \| `member` \| `user` |
| phone | String | 선택 | 전화번호 |
| profile_photo_url | String | 선택 | 프로필 사진 URL |
| is_active | Boolean | 필수 | 활성 여부 |
| email_verified | Boolean | 필수 | 이메일 인증 여부 |

### 에러

- `email` 쿼리가 없으면 `404 Not Found` (`"email query is required"`)
- 일치하는 사용자가 없으면 `404 Not Found` (`"사용자를 찾지 못했습니다."`)
