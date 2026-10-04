# Tickets API

집회 티켓(`tickets`)과 신청(`ticket_applications`). 비배포 페이지 Tickets용입니다. `worship_logs`와는 `worship_id`로 느슨하게 연결되지만 별개 테이블입니다. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## tickets

### 티켓 전체 조회

**Request Syntax**

```bash
curl -X GET "http://{SERVER_URL}/tickets?status=OPEN&year=2026"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/tickets |

**Query Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| status | String | 선택 | `OPEN` \| `CLOSED` \| `CANCELED` |
| year | Integer | 선택 | 연도 필터 |

**Response Syntax**

```json
[
  {
    "id": 1,
    "worship_id": 1,
    "title": "2026 여름 청년집회",
    "date": "2026-08-15",
    "year": 2026,
    "poster_url": "/files/17",
    "place": "예수인교회",
    "preacher": "홍길동 목사",
    "description": null,
    "status": "OPEN",
    "max_capacity": 200,
    "application_deadline": "2026-08-10T00:00:00.000Z",
    "price_infant": 0,
    "price_teen": 5000,
    "price_military": 5000,
    "price_adult": 10000,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 티켓 고유 번호 |
| worship_id | Integer | 선택 | 연결된 집회 |
| title | String | 필수 | |
| date | String | 필수 | |
| year | Integer | 필수 | |
| poster_url | String | 선택 | |
| place | String | 선택 | |
| preacher | String | 선택 | |
| description | String | 선택 | |
| status | String | 필수 | `OPEN` \| `CLOSED` \| `CANCELED` (기본값 `OPEN`) |
| max_capacity | Integer | 선택 | |
| application_deadline | String | 선택 | ISO 날짜 문자열 |
| price_infant | Integer | 필수 | 기본값 0 |
| price_teen | Integer | 필수 | 기본값 0 |
| price_military | Integer | 필수 | 기본값 0 |
| price_adult | Integer | 필수 | 기본값 0 |
| created_at | String | 필수 | |
| updated_at | String | 필수 | |

---

### 티켓 단건 조회

**Request Syntax**

```bash
curl -X GET http://{SERVER_URL}/tickets/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/tickets/{id} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 티켓 고유 번호 |

**Response**: [티켓 전체 조회](#티켓-전체-조회)의 단건 객체와 동일

---

### 티켓 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/tickets \
  -H "Content-Type: application/json" \
  -d '{
        "title": "2026 여름 청년집회",
        "date": "2026-08-15",
        "year": 2026
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/tickets |

**Request Header**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

**Request Elements**

[티켓 전체 조회](#티켓-전체-조회)의 Response Elements 중 `id`/`created_at`/`updated_at`을 제외한 필드와 동일

**Response**: 생성된 티켓 객체를 반환합니다. (상태 코드 `201`)

---

### worship 정보로 티켓 생성

기존 `worship_logs` 레코드 정보를 기반으로 티켓을 생성합니다.

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/tickets/from-worship \
  -H "Content-Type: application/json" \
  -d '{ "worship_id": 1, "max_capacity": 200 }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/tickets/from-worship |

**Request Header**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| worship_id | Integer | 필수 | 참조할 집회 고유 번호 |
| (그 외) | - | 선택 | [티켓 생성](#티켓-생성) 필드 중 덮어쓸 값만 선택적으로 전달 |

**Response**: 생성된 티켓 객체를 반환합니다.

---

### 티켓 수정

**Request Syntax**

```bash
curl -X PATCH http://{SERVER_URL}/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{ "status": "CLOSED" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/tickets/{id} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 티켓 고유 번호 |

**Request Elements**: [티켓 생성](#티켓-생성)의 필드가 모두 선택 사항입니다.

**Response**: 수정된 티켓 객체를 반환합니다.

---

### 티켓 삭제

**Request Syntax**

```bash
curl -X DELETE http://{SERVER_URL}/tickets/1
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/tickets/{id} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 티켓 고유 번호 |

**Response**: 삭제된 티켓 객체를 반환합니다.

---

## ticket-applications

### 신청 전체 조회

**Request Syntax**

```bash
curl -X GET "http://{SERVER_URL}/ticket-applications?ticket_id=1"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/ticket-applications |

**Query Parameters** (우선순위: `user_id` > `ticket_id` > 전체)

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| user_id | Integer | 선택 | 특정 사용자의 신청 내역 |
| ticket_id | Integer | 선택 | 특정 티켓의 신청 목록 |

**Response Syntax**

```json
[
  {
    "id": 1,
    "ticket_id": 1,
    "user_id": 1,
    "applicant_name": "홍길동",
    "applicant_phone": "010-1234-5678",
    "applicant_email": "hong@example.com",
    "party_size": 2,
    "status": "PENDING",
    "payment_status": "UNPAID",
    "memo": null,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |
| ticket_id | Integer | 필수 | 티켓 고유 번호 |
| user_id | Integer | 필수 | 신청자 사용자 번호 |
| applicant_name | String | 필수 | |
| applicant_phone | String | 필수 | |
| applicant_email | String | 선택 | |
| party_size | Integer | 필수 | 기본값 1, 최소 1 |
| status | String | 필수 | `PENDING` \| `CONFIRMED` \| `CANCELLED` (기본값 `PENDING`) |
| payment_status | String | 필수 | `UNPAID` \| `PAID` \| `FREE` (기본값 `UNPAID`) |
| memo | String | 선택 | |
| created_at | String | 필수 | |
| updated_at | String | 필수 | |

---

### 티켓별 신청 통계

**Request Syntax**

```bash
curl -X GET http://{SERVER_URL}/ticket-applications/stats/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/ticket-applications/stats/{ticketId} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| ticketId | Integer | 필수 | 티켓 고유 번호 |

**Response**: 신청 인원 합계/상태별 집계 등 통계 객체 (서비스 구현에 따름)

---

### 신청 단건 조회

**Request Syntax**

```bash
curl -X GET http://{SERVER_URL}/ticket-applications/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/ticket-applications/{id} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |

**Response**: [신청 전체 조회](#신청-전체-조회)의 단건 객체와 동일

---

### 신청 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/ticket-applications \
  -H "Content-Type: application/json" \
  -d '{
        "ticket_id": 1,
        "user_id": 1,
        "applicant_name": "홍길동",
        "applicant_phone": "010-1234-5678"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/ticket-applications |

**Request Header**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

**Request Elements**

[신청 전체 조회](#신청-전체-조회)의 Response Elements 중 `id`/`created_at`/`updated_at`을 제외한 필드와 동일

**Response**: 생성된 신청 객체를 반환합니다. (상태 코드 `201`)

---

### 신청 수정

**Request Syntax**

```bash
curl -X PATCH http://{SERVER_URL}/ticket-applications/1 \
  -H "Content-Type: application/json" \
  -d '{ "party_size": 3 }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/ticket-applications/{id} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |

**Request Elements**: [신청 생성](#신청-생성)의 필드가 모두 선택 사항입니다.

**Response**: 수정된 신청 객체를 반환합니다.

---

### 신청 취소

**Request Syntax**

```bash
curl -X PATCH http://{SERVER_URL}/ticket-applications/1/cancel
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/ticket-applications/{id}/cancel |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |

**Response**: `status`가 `CANCELLED`로 변경된 신청 객체를 반환합니다.

---

### 신청 상태 변경 (관리자용)

**Request Syntax**

```bash
curl -X PATCH http://{SERVER_URL}/ticket-applications/1/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "CONFIRMED" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/ticket-applications/{id}/status |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| status | String | 필수 | `PENDING` \| `CONFIRMED` \| `CANCELLED` |

**Response**: 수정된 신청 객체를 반환합니다.

---

### 결제 상태 변경 (관리자용)

**Request Syntax**

```bash
curl -X PATCH http://{SERVER_URL}/ticket-applications/1/payment \
  -H "Content-Type: application/json" \
  -d '{ "payment_status": "PAID" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/ticket-applications/{id}/payment |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| payment_status | String | 필수 | `UNPAID` \| `PAID` \| `FREE` |

**Response**: 수정된 신청 객체를 반환합니다.

---

### 신청 삭제

**Request Syntax**

```bash
curl -X DELETE http://{SERVER_URL}/ticket-applications/1
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/ticket-applications/{id} |

**Path Parameters**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 신청 고유 번호 |

**Response**: 삭제된 신청 객체를 반환합니다.
