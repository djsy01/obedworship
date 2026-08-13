# Worship API

집회(예배) 기록(`worship_logs`)의 CRUD. WorshipLog(`/worship-log`) 목록/상세 페이지의 핵심 API입니다. 사진/악보/찬양/영상 등 하위 리소스는 [worship-media.md](./worship-media.md) 참고. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 집회 전체 조회

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/worship?year=2026"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/worship |

### Request Header

없음

### Query Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| year | Integer | 선택 | 특정 연도만 조회 |

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "title": "2026 여름 청년집회",
    "date": "2026-08-15",
    "year": 2026,
    "preacher": "홍길동 목사",
    "worship_team": "Worship팀",
    "guest": null,
    "description": "집회 소개",
    "poster_url": "https://storage.googleapis.com/.../posters/xxx.jpg",
    "comments": null,
    "entry_time": "18:00",
    "start_time": "19:00",
    "location": "예수인교회",
    "location_link": "https://map.kakao.com/...",
    "parking": null,
    "seating": null,
    "promo_video": "https://youtube.com/...",
    "prelisten_video": "https://youtube.com/...",
    "excluded_songs": [],
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 집회 고유 번호 |
| title | String | 필수 | 최대 200자 |
| date | String | 필수 | 자유 형식 문자열, 최대 50자 |
| year | Integer | 필수 | 2000~2100 |
| preacher | String | 필수 | 최대 100자 |
| worship_team | String | 필수 | 최대 100자 |
| guest | String | 선택 | 최대 100자 |
| description | String | 필수 | |
| poster_url | String | 선택 | 최대 500자 |
| comments | String | 선택 | |
| entry_time | String | 선택 | 최대 50자 |
| start_time | String | 선택 | 최대 50자 |
| location | String | 선택 | 최대 255자 |
| location_link | String | 선택 | 최대 500자 |
| parking | String | 선택 | |
| seating | String | 선택 | |
| promo_video | String | 선택 | 최대 500자 |
| prelisten_video | String | 선택 | 최대 500자 |
| excluded_songs | String[] | 선택 | JSON 컬럼 |
| created_at | String | 필수 | 생성 일시 |
| updated_at | String | 필수 | 수정 일시 |

---

## 집회 단건 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/worship/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/worship/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 집회 고유 번호 |

### Response

[집회 전체 조회](#집회-전체-조회)의 단건 객체와 동일. WorshipDetail 페이지는 하위 리소스(사진/악보/찬양/영상)는 별도 API로 조회합니다.

---

## 집회 생성

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/worship \
  -H "Content-Type: application/json" \
  -d '{
        "title": "2026 여름 청년집회",
        "date": "2026-08-15",
        "year": 2026,
        "preacher": "홍길동 목사",
        "worship_team": "Worship팀",
        "description": "집회 소개"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

[집회 전체 조회](#집회-전체-조회)의 Response Elements와 동일한 필드(단, `id`/`created_at`/`updated_at` 제외). 필수여부도 동일하게 적용됩니다.

> `CreateWorshipDto`에는 `opening_songs`, `celebration_songs` 필드도 정의되어 있으나 `worship_logs` 테이블에는 대응 컬럼이 없어 저장되지 않습니다. 실제로는 [worship-media.md](./worship-media.md)의 `worship-songs` 하위 리소스로 별도 관리합니다.

### Response

생성된 집회 객체를 반환합니다. (상태 코드 `201`)

---

## 집회 수정

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/worship/1 \
  -H "Content-Type: application/json" \
  -d '{ "poster_url": "https://storage.googleapis.com/.../posters/xxx.jpg" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/worship/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 집회 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

[집회 생성](#집회-생성)의 필드가 모두 선택 사항입니다(변경할 필드만 전송).

### Response

수정된 집회 객체를 반환합니다.

---

## 집회 삭제

### Request Syntax

```bash
curl -X DELETE http://{SERVER_URL}/worship/1
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/worship/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 집회 고유 번호 |

### Request Header

없음

### Response

삭제된 집회 객체를 반환합니다.

> 연관된 `worship_photos`, `worship_scores`, `worship_songs`, `worship_videos`는 DB 레벨 `onDelete: Cascade`로 함께 삭제됩니다. `tickets`는 `worship_id`가 nullable이라 삭제되지 않고 연결만 해제될 수 있습니다.
