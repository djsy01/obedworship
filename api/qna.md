# Qna API

> 운영 Node.js API의 Q&A 응답은 `author_label`과 `can_delete`를 반환합니다. 공개 응답과 다른 일반 사용자의 응답에서 `author_label`은 `익명`이며 `user_id` 필드는 생략합니다. 작성자와 관리자는 전체 작성자 ID를 볼 수 있으며, 질문 삭제는 작성자만 할 수 있습니다. 이전 데이터의 문자열 ID는 `author_label`에 표시하고 `user_id` 필드는 생략합니다.

Q&A 게시판의 운영 Express API입니다. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## Qna 전체 조회

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/qna?category=집회"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/qna |

### Request Header

없음

### Query Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| category | String | 선택 | `집회` \| `악보` \| `기타` |

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "author_label": "익명",
    "can_delete": false,
    "category": "집회",
    "title": "집회 일정 문의",
    "content": "다음 집회는 언제인가요?",
    "answer": null,
    "answer_date": null,
    "status": "WAITING",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | Qna 고유 번호 |
| user_id | Integer | 선택 | 작성자 본인과 운영 권한이 있는 사용자에게 표시 |
| author_label | String | 필수 | 표시용 작성자 |
| can_delete | Boolean | 필수 | 삭제 가능 여부 |
| category | String | 필수 | `집회` \| `악보` \| `기타` |
| title | String | 필수 | 최대 200자 |
| content | String | 필수 | |
| answer | String | 선택 | 관리자 답변 |
| answer_date | String | 선택 | 답변 일시 |
| status | String | 필수 | `WAITING` \| `ANSWERED` (기본값 `WAITING`) |
| created_at | String | 필수 | |
| updated_at | String | 필수 | |

---

## Qna 단건 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/qna/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/qna/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | Qna 고유 번호 |

### Response

[Qna 전체 조회](#qna-전체-조회)의 단건 객체와 동일

---

## Qna 생성

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/qna \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
        "category": "집회",
        "title": "집회 일정 문의",
        "content": "다음 집회는 언제인가요?"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/qna |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Authorization | String | 필수 | `Bearer <token>` |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| category | String | 필수 | `집회` \| `악보` \| `기타` |
| title | String | 필수 | |
| content | String | 필수 | |

### Response

생성된 Qna 객체(`status: "WAITING"`)를 반환합니다. (상태 코드 `201`)

---

## Qna 답변 등록

`admin`과 `operator`만 답변을 등록할 수 있습니다. 등록 시 `status`가 `ANSWERED`로 바뀌고 `answer_date`가 현재 시각으로 갱신됩니다.

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/qna/1/answer \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{ "answer": "다음 집회는 8월 15일입니다." }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/qna/{id}/answer |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | Qna 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Authorization | String | 필수 | `Bearer <token>` |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| answer | String | 필수 | 답변 내용 |

### Response

수정된 Qna 객체를 반환합니다.

---

## Qna 삭제

### Request Syntax

```bash
curl -X DELETE http://{SERVER_URL}/qna/1 \
  -H "Authorization: Bearer ${TOKEN}"
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/qna/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | Qna 고유 번호 |

### Response

작성자 본인이 삭제하면 본문 없이 `204`를 반환합니다.
