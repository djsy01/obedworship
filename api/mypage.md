# Mypage API

로그인한 사용자(`user_id` 기준)의 마이페이지 정보. 비배포 페이지 MyPage용입니다. 모든 경로가 `:userId`를 path param으로 받으며, 인증 세션이 아닌 URL 파라미터로 사용자를 특정합니다(서버 인증 미구현 상태와 연관, [README](./README.md#인증-상태-중요) 참고). 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 대시보드 조회

프로필, 신청 내역, Q&A, 다운로드 내역, 통계를 한 번에 조회합니다(4개 쿼리를 병렬 실행).

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/mypage/1/dashboard
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/mypage/{userId}/dashboard |

### Request Header

없음

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

### Response

#### Response Syntax

```json
{
  "profile": { "...": "GET /mypage/{userId}/profile 응답과 동일" },
  "applications": [ "...GET /mypage/{userId}/applications 응답과 동일" ],
  "qnas": [ "...GET /mypage/{userId}/qnas 응답과 동일" ],
  "downloads": [ "...GET /mypage/{userId}/downloads 응답과 동일" ],
  "stats": {
    "totalApplications": 3,
    "confirmedApplications": 2,
    "totalQnas": 1,
    "answeredQnas": 1,
    "totalDownloads": 5
  }
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| profile | Object | 필수 | [프로필 조회](#프로필-조회) 응답과 동일 |
| applications | Array | 필수 | [신청 내역 조회](#신청-내역-조회) 응답과 동일 |
| qnas | Array | 필수 | [qa-목록-조회](#qa-목록-조회) 응답과 동일 |
| downloads | Array | 필수 | [악보-다운로드-내역-조회](#악보-다운로드-내역-조회) 응답과 동일 |
| stats.totalApplications | Integer | 필수 | 총 신청 건수 |
| stats.confirmedApplications | Integer | 필수 | `status === "CONFIRMED"` 건수 |
| stats.totalQnas | Integer | 필수 | 총 Q&A 건수 |
| stats.answeredQnas | Integer | 필수 | `status === "ANSWERED"` 건수 |
| stats.totalDownloads | Integer | 필수 | 총 다운로드 건수 |

---

## 프로필 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/mypage/1/profile
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/mypage/{userId}/profile |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

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
  "email_verified": true,
  "created_at": "2026-01-01T00:00:00.000Z",
  "last_login_at": "2026-08-13T00:00:00.000Z",
  "members": {
    "id": 1,
    "name": "홍길동",
    "affiliation": "청년부",
    "photo_url": null,
    "member_roles": [],
    "member_worship_positions": [],
    "member_step_positions": []
  }
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 사용자 고유 번호 |
| email | String | 필수 | |
| name | String | 필수 | |
| role | String | 필수 | `admin` \| `operator` \| `member` \| `user` |
| phone | String | 선택 | |
| profile_photo_url | String | 선택 | |
| email_verified | Boolean | 필수 | |
| created_at | String | 필수 | |
| last_login_at | String | 선택 | |
| members | Object | 선택 | 연결된 멤버 정보. 매핑된 member가 없으면 `null` |
| members.member_roles | Array | 필수 | [members.md](./members.md)의 `member_roles[]` |
| members.member_worship_positions | Array | 필수 | [members.md](./members.md)의 `member_worship_positions[]` |
| members.member_step_positions | Array | 필수 | [members.md](./members.md)의 `member_step_positions[]` |

### 에러

사용자가 없으면 `404 Not Found`

---

## 신청 내역 조회

사용자의 티켓 신청 내역. `created_at` 내림차순.

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/mypage/1/applications
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/mypage/{userId}/applications |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "ticket_id": 1,
    "user_id": 1,
    "applicant_name": "홍길동",
    "applicant_phone": "010-1234-5678",
    "party_size": 2,
    "status": "CONFIRMED",
    "payment_status": "PAID",
    "created_at": "2026-01-01T00:00:00.000Z",
    "tickets": {
      "id": 1,
      "title": "2026 여름 청년집회",
      "date": "2026-08-15",
      "year": 2026,
      "place": "예수인교회",
      "poster_url": null,
      "status": "OPEN"
    }
  }
]
```

#### Response Elements

[tickets.md](./tickets.md)의 `TicketApplication` 필드에 아래 `tickets` 객체가 추가됩니다.

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| tickets.id | Integer | 필수 | 티켓 고유 번호 |
| tickets.title | String | 필수 | |
| tickets.date | String | 필수 | |
| tickets.year | Integer | 필수 | |
| tickets.place | String | 선택 | |
| tickets.poster_url | String | 선택 | |
| tickets.status | String | 필수 | `OPEN` \| `CLOSED` \| `CANCELED` |

---

## Q&A 목록 조회

사용자가 작성한 Q&A 목록. `created_at` 내림차순.

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/mypage/1/qnas
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/mypage/{userId}/qnas |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

### Response

[qna.md](./qna.md)의 `Qna[]`와 동일

---

## 악보 다운로드 내역 조회

사용자의 악보 다운로드 이력. `downloaded_at` 내림차순.

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/mypage/1/downloads
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/mypage/{userId}/downloads |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "score_id": 1,
    "user_id": 1,
    "downloaded_at": "2026-01-01T00:00:00.000Z",
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0 ...",
    "scores": {
      "id": 1,
      "title": "은혜",
      "category": "경배와찬양",
      "song_key": "C",
      "bpm": 72,
      "thumbnail_url": null,
      "file_url": "/files/9"
    }
  }
]
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 다운로드 이력 고유 번호 |
| score_id | Integer | 필수 | 악보 고유 번호 |
| user_id | Integer | 필수 | 사용자 고유 번호 |
| downloaded_at | String | 필수 | |
| ip_address | String | 선택 | |
| user_agent | String | 선택 | |
| scores | Object | 필수 | 요약 정보([scores.md](./scores.md) 필드 일부) |

---

## 최근 활동 요약

최근 N일간의 활동 요약(신청/문의/다운로드 건수).

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/mypage/1/activity?days=30"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/mypage/{userId}/activity |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

### Query Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| days | Integer | 선택 | 조회 기간(일), 기본값 30 |

### Response

#### Response Syntax

```json
{
  "period": "30일",
  "recentApplications": 1,
  "recentQnas": 0,
  "recentDownloads": 2
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| period | String | 필수 | 예: `"30일"` |
| recentApplications | Integer | 필수 | |
| recentQnas | Integer | 필수 | |
| recentDownloads | Integer | 필수 | |

---

## 프로필 수정

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/mypage/1/profile \
  -H "Content-Type: application/json" \
  -d '{ "name": "홍길동", "phone": "010-1234-5678" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/mypage/{userId}/profile |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| userId | Integer | 필수 | 사용자 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| name | String | 선택 | |
| phone | String | 선택 | |
| profile_photo_url | String | 선택 | |

### Response

#### Response Syntax

```json
{
  "id": 1,
  "email": "hong@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "profile_photo_url": null,
  "updated_at": "2026-08-13T00:00:00.000Z"
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | |
| email | String | 필수 | |
| name | String | 필수 | |
| phone | String | 선택 | |
| profile_photo_url | String | 선택 | |
| updated_at | String | 필수 | |
