# Assets API

사이트 전역에서 쓰이는 정적 자산(이미지/오디오/영상/문서)을 `asset_key` 기준으로 관리합니다. Home 페이지의 팀 사진(`home_team_photo`)처럼 "키-값" 형태로 조회하는 용도입니다. 업로드는 GCS(`StorageService`)를 사용합니다. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 자산 전체 조회

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/assets?category=home"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/assets |

### Request Header

없음

### Query Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| category | String | 선택 | 지정 시 해당 카테고리만 반환 |

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "asset_key": "home_team_photo",
    "asset_type": "image",
    "category": "home",
    "file_url": "https://storage.googleapis.com/.../assets/home/xxx.jpg",
    "file_name": "team.jpg",
    "file_size": 204800,
    "mime_type": "image/jpeg",
    "title": "팀 사진",
    "description": null,
    "display_order": 0,
    "is_active": true,
    "uploaded_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 자산 고유 번호 |
| asset_key | String | 필수 | 유일 키 (예: `home_team_photo`) |
| asset_type | String | 필수 | `image` \| `audio` \| `video` \| `document` |
| category | String | 필수 | |
| file_url | String | 선택 | |
| file_name | String | 선택 | |
| file_size | Integer | 선택 | |
| mime_type | String | 선택 | |
| title | String | 선택 | |
| description | String | 선택 | |
| display_order | Integer | 필수 | 기본값 0 |
| is_active | Boolean | 필수 | 기본값 true |
| uploaded_at | String | 필수 | |
| updated_at | String | 필수 | |

---

## 자산 키로 조회

`asset_key`로 단건 조회합니다. `assetApi.getByKey("home_team_photo")` 같은 프론트 호출이 사용하는 엔드포인트입니다.

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/assets/key/home_team_photo
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/assets/key/{key} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| key | String | 필수 | `asset_key` 값 |

### Response

[자산 전체 조회](#자산-전체-조회)의 단건 객체와 동일

---

## 자산 ID로 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/assets/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/assets/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 자산 고유 번호 |

### Response

[자산 전체 조회](#자산-전체-조회)의 단건 객체와 동일

---

## 자산 생성 (메타데이터만)

파일 URL을 이미 알고 있는 경우 메타데이터만으로 자산을 생성합니다.

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/assets \
  -H "Content-Type: application/json" \
  -d '{
        "asset_key": "home_team_photo",
        "asset_type": "image",
        "category": "home",
        "file_url": "https://storage.googleapis.com/.../assets/home/xxx.jpg"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/assets |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| asset_key | String | 필수 | 유일 키 |
| asset_type | String | 필수 | `image` \| `audio` \| `video` \| `document` |
| category | String | 필수 | |
| file_url | String | 선택 | |
| file_name | String | 선택 | |
| file_size | Integer | 선택 | |
| mime_type | String | 선택 | |
| title | String | 선택 | |
| description | String | 선택 | |
| display_order | Integer | 선택 | |
| is_active | Boolean | 선택 | |

### Response

생성된 자산 객체를 반환합니다. (상태 코드 `201`)

---

## 자산 파일 업로드

파일을 GCS에 업로드하고, `asset_key` 기준으로 기존 자산이 있으면 갱신, 없으면 새로 생성합니다(upsert). `asset_type`은 파일의 `mimetype`으로 자동 판별됩니다. 기존 자산 갱신 시 이전 파일은 GCS에서 삭제를 시도합니다(실패해도 무시).

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/assets/upload \
  -F "file=@/path/to/team.jpg" \
  -F "asset_key=home_team_photo" \
  -F "category=home" \
  -F "title=팀 사진"
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/assets/upload |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | multipart/form-data |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| file | File | 필수 | |
| asset_key | String | 필수 | |
| category | String | 필수 | |
| title | String | 선택 | |
| description | String | 선택 | |

### Response

생성 또는 갱신된 자산 객체를 반환합니다.

### 에러

파일 없음 또는 `asset_key`/`category` 누락 시 `400 Bad Request`

---

## 자산 수정 (ID)

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/assets/1 \
  -H "Content-Type: application/json" \
  -d '{ "title": "새 팀 사진" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/assets/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 자산 고유 번호 |

### Request Elements

[자산 생성](#자산-생성-메타데이터만)의 필드가 모두 선택 사항입니다.

### Response

수정된 자산 객체를 반환합니다.

---

## 자산 수정 (키)

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/assets/key/home_team_photo \
  -H "Content-Type: application/json" \
  -d '{ "title": "새 팀 사진" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/assets/key/{key} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| key | String | 필수 | `asset_key` 값 |

### Request Elements

[자산 생성](#자산-생성-메타데이터만)의 필드가 모두 선택 사항입니다.

### Response

수정된 자산 객체를 반환합니다.

---

## 자산 삭제

GCS 파일도 함께 삭제 후 DB 레코드를 삭제합니다.

### Request Syntax

```bash
curl -X DELETE http://{SERVER_URL}/assets/1
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/assets/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 자산 고유 번호 |

### Response

삭제된 자산 객체를 반환합니다.
