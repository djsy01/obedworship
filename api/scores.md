# Scores API

악보 라이브러리(비배포 페이지 Scores용). 파일은 GCS가 아닌 **서버 로컬 디스크**(`uploads/scores/`)에 저장됩니다. 특정 집회에 첨부되는 [worship-media.md](./worship-media.md)의 `worship-scores`와는 별개 리소스입니다. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 악보 파일 업로드

PDF 파일을 서버 로컬 디스크에 업로드합니다(DB 레코드는 생성하지 않음). 이후 반환된 `url`/`filename`으로 [악보 생성](#악보-생성)을 호출해 레코드를 만들어야 합니다.

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/scores/upload \
  -F "file=@/path/to/score.pdf"
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/scores/upload |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | multipart/form-data |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| file | File | 필수 | PDF만 허용, 최대 10MB |

### Response

#### Response Syntax

```json
{
  "filename": "찬양악보.pdf",
  "savedFilename": "찬양악보-1699999999999-123456789.pdf",
  "size": 204800,
  "mimetype": "application/pdf",
  "url": "/uploads/scores/찬양악보-1699999999999-123456789.pdf"
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| filename | String | 필수 | 원본 파일명 |
| savedFilename | String | 필수 | 서버 저장 파일명(한글 인코딩 보정됨) |
| size | Integer | 필수 | 바이트 단위 |
| mimetype | String | 필수 | |
| url | String | 필수 | `/uploads/scores/{savedFilename}` |

### 에러

PDF가 아니면 `400 Bad Request`

---

## 악보 전체 조회

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/scores?search=은혜"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/scores |

### Request Header

없음

### Query Parameters

우선순위: `search` > `category` > `key` > 전체 (조합 불가)

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| search | String | 선택 | 제목 등 검색어 |
| category | String | 선택 | 카테고리 필터 |
| key | String | 선택 | `song_key` 필터 |

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "title": "은혜",
    "song_key": "C",
    "bpm": 72,
    "category": "경배와찬양",
    "file_url": "/files/9",
    "filename": "은혜.pdf",
    "file_size": 204800,
    "thumbnail_url": null,
    "description": null,
    "composer": null,
    "arranger": null,
    "original_song": null,
    "is_original": true,
    "copyright_info": null,
    "uploaded_by": 1,
    "download_count": 0,
    "is_public": true,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 악보 고유 번호 |
| title | String | 필수 | 1~200자 |
| song_key | String | 필수 | 정규식 `^[A-G](#\|b)?$` (예: `C`, `D#`, `Eb`) |
| bpm | Integer | 필수 | 40~240 |
| category | String | 필수 | |
| file_url | String | 필수 | |
| filename | String | 필수 | |
| file_size | Integer | 선택 | |
| thumbnail_url | String | 선택 | |
| description | String | 선택 | |
| composer | String | 선택 | |
| arranger | String | 선택 | |
| original_song | String | 선택 | |
| is_original | Boolean | 필수 | 기본값 true |
| copyright_info | String | 선택 | |
| uploaded_by | Integer | 선택 | |
| download_count | Integer | 필수 | 기본값 0 |
| is_public | Boolean | 필수 | 기본값 true |
| created_at | String | 필수 | |
| updated_at | String | 필수 | |

---

## 악보 단건 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/scores/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/scores/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 악보 고유 번호 |

### Response

[악보 전체 조회](#악보-전체-조회)의 단건 객체와 동일

---

## 악보 파일 다운로드

파일 다운로드(스트림 응답). 호출 시 `download_count`가 자동 증가합니다.

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/scores/download/1 -OJ
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/scores/download/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 악보 고유 번호 |

### Response

파일 바이너리 (`Content-Disposition: attachment`)

### 에러

악보/파일 정보 없음 또는 서버에 파일이 실제로 없으면 `404 Not Found`

---

## 악보 생성

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/scores \
  -H "Content-Type: application/json" \
  -d '{
        "title": "은혜",
        "song_key": "C",
        "bpm": 72,
        "category": "경배와찬양",
        "file_url": "/files/9",
        "filename": "은혜.pdf"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/scores |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

[악보 전체 조회](#악보-전체-조회)의 Response Elements 중 `id`, `download_count`, `created_at`, `updated_at`을 제외한 필드와 동일 (`file_url`/`filename`은 업로드 응답 값을 사용)

### Response

생성된 악보 객체를 반환합니다. (상태 코드 `201`)

---

## 악보 수정

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/scores/1 \
  -H "Content-Type: application/json" \
  -d '{ "description": "코드 수정" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/scores/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 악보 고유 번호 |

### Request Elements

[악보 생성](#악보-생성)의 필드가 모두 선택 사항입니다.

### Response

수정된 악보 객체를 반환합니다.

---

## 악보 다운로드 수 수동 증가

외부 링크 클릭 등 트래킹 목적으로 다운로드 수만 증가시킬 때 사용합니다.

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/scores/1/download
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/scores/{id}/download |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 악보 고유 번호 |

### Response

갱신된 악보 객체(`download_count` 1 증가)를 반환합니다.

---

## 악보 삭제

DB 레코드와 로컬 파일을 함께 삭제합니다(파일 삭제 실패해도 DB는 삭제).

### Request Syntax

```bash
curl -X DELETE http://{SERVER_URL}/scores/1
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/scores/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 악보 고유 번호 |

### Response

삭제된 악보 객체를 반환합니다.
