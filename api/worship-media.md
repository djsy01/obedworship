# Worship Media API

집회(worship) 상세에 딸린 하위 리소스: 사진, 악보, 찬양(곡 리스트), 영상. WorshipDetail(`/worship-log/:id`) 페이지가 사용합니다. 사진/악보 업로드는 DB `files` 테이블에 저장합니다 (2026-08-13부터, [README의 파일 저장 방식](./README.md#파일-저장-방식-2026-08-13-변경) 참고). 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## worship-photos

### WorshipPhoto 사진 업로드 (단일)

`files` 테이블에 업로드만 수행합니다(`/files/{id}` 반환). DB 반영은 별도로 `POST /worship-photos`를 호출해야 합니다.

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/worship-photos/upload \
  -F "photo=@/path/to/photo.jpg"
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship-photos/upload |

**Request Header**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | multipart/form-data |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| photo | File | 필수 | 이미지 파일만 허용 |

**Response Syntax**

```json
{ "photo_url": "/files/17" }
```

**에러**: 파일 없음 또는 이미지가 아니면 `400 Bad Request`

### WorshipPhoto 사진 업로드 (다중, 최대 100개)

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/worship-photos/upload-multiple \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg"
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship-photos/upload-multiple |

**Request Header**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | multipart/form-data |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| photos | File[] | 필수 | 이미지 파일 배열, 최대 100개 |

**Response Syntax**

```json
{
  "count": 2,
  "photos": [
    { "photo_url": "/files/17" },
    { "photo_url": "/files/18" }
  ]
}
```

**에러**: 파일 없음 또는 이미지가 아닌 파일 포함 시 `400 Bad Request`

### WorshipPhoto 레코드 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/worship-photos \
  -H "Content-Type: application/json" \
  -d '{
        "worship_id": 1,
        "photo_url": "/files/17",
        "file_name": "xxx.jpg",
        "photo_order": 1
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship-photos |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| photo_url | String | 필수 | 최대 500자 |
| thumbnail_url | String | 선택 | 최대 500자 |
| file_name | String | 필수 | 최대 255자 |
| file_size | Integer | 선택 | |
| photo_order | Integer | 필수 | 정렬 순서 |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| photo_url | String | 필수 | |
| thumbnail_url | String | 선택 | |
| file_name | String | 필수 | |
| file_size | Integer | 선택 | |
| photo_order | Integer | 선택 | 기본값 0 |
| uploaded_at | String | 필수 | |

### WorshipPhoto 조회/수정/삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/worship-photos/worship/{worshipId} | 특정 집회의 사진 전체 조회 |
| GET | http://{SERVER_URL}/worship-photos | 전체 조회 |
| GET | http://{SERVER_URL}/worship-photos/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/worship-photos/{id} | 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/worship-photos/{id} | 삭제, 삭제된 레코드 반환 |

---

## worship-scores

특정 집회에 첨부된 악보 파일. 악보 라이브러리 전체를 다루는 [scores.md](./scores.md)와는 별개 리소스입니다. 파일 업로드 전용 엔드포인트는 없으며, `file_url`을 이미 확보한 상태로 레코드를 생성해야 합니다.

### WorshipScore 레코드 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/worship-scores \
  -H "Content-Type: application/json" \
  -d '{
        "worship_id": 1,
        "filename": "찬양악보.pdf",
        "file_url": "/files/11"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship-scores |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| filename | String | 필수 | |
| file_url | String | 필수 | |
| file_size | Integer | 선택 | |
| thumbnail_url | String | 선택 | |
| description | String | 선택 | |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| filename | String | 필수 | |
| file_url | String | 필수 | |
| file_size | Integer | 선택 | |
| thumbnail_url | String | 선택 | |
| description | String | 선택 | |
| uploaded_by | Integer | 선택 | |
| uploaded_at | String | 필수 | |

### WorshipScore 조회/수정/삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/worship-scores/worship/{worshipId} | 특정 집회의 악보 전체 조회 |
| GET | http://{SERVER_URL}/worship-scores | 전체 조회 |
| GET | http://{SERVER_URL}/worship-scores/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/worship-scores/{id} | 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/worship-scores/{id} | 삭제, 삭제된 레코드 반환 |

---

## worship-songs

집회 순서상의 곡 리스트(오프닝/경배와찬양 등).

### WorshipSong 레코드 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/worship-songs \
  -H "Content-Type: application/json" \
  -d '{
        "worship_id": 1,
        "category": "opening",
        "song_order": 1,
        "song_name": "은혜"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship-songs |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| category | String | 필수 | `opening` \| `celebration` |
| song_order | Integer | 필수 | 정렬 순서 |
| song_name | String | 필수 | 최대 200자 |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| category | String | 필수 | `opening` \| `celebration` |
| song_order | Integer | 필수 | |
| song_name | String | 필수 | |

### WorshipSong 조회/수정/삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/worship-songs/worship/{worshipId} | 특정 집회의 곡 목록 조회 |
| GET | http://{SERVER_URL}/worship-songs | 전체 조회 |
| GET | http://{SERVER_URL}/worship-songs/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/worship-songs/{id} | 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/worship-songs/{id} | 삭제, 삭제된 레코드 반환 |

---

## worship-videos

집회 관련 영상(홍보영상/미리듣기 외 추가 영상 목록).

> 참고: WorshipDetail의 "안내" 탭에 있는 홍보영상(`promo_video`)/미리듣기(`prelisten_video`)는 `worship_logs` 테이블([worship.md](./worship.md))의 필드이며, 이 `worship-videos` 리소스와는 별개입니다. 현재 실배포 대상 탭에서는 영상/사진 탭(`worship-photos`, `worship-videos`)이 주석 처리되어 사용되지 않습니다.

### WorshipVideo 레코드 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/worship-videos \
  -H "Content-Type: application/json" \
  -d '{
        "worship_id": 1,
        "video_url": "https://youtube.com/watch?v=xxx",
        "video_order": 1
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/worship-videos |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| video_url | String | 필수 | 최대 500자 |
| video_order | Integer | 필수 | 정렬 순서 |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| worship_id | Integer | 필수 | 집회 고유 번호 |
| video_url | String | 필수 | |
| video_order | Integer | 선택 | 기본값 1 |
| uploaded_at | String | 필수 | |

### WorshipVideo 조회/수정/삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/worship-videos/worship/{worshipId} | 특정 집회의 영상 목록 조회 |
| GET | http://{SERVER_URL}/worship-videos | 전체 조회 |
| GET | http://{SERVER_URL}/worship-videos/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/worship-videos/{id} | 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/worship-videos/{id} | 삭제, 삭제된 레코드 반환 |
