# Photos API

범용 이미지 업로드 엔드포인트. **서버 로컬 디스크**(`uploads/photos/`)에 저장합니다. DB 테이블/서비스가 없는 순수 업로드 유틸리티 컨트롤러입니다.

> ⚠️ 2026-08-13부로 다른 도메인(`assets`, `members`, `scores`, `worship-photos`, `worship-scores`)은 DB `files` 테이블 저장 방식으로 전환됐지만(`[README](./README.md#파일-저장-방식-2026-08-13-변경)` 참고), 이 `photos` 엔드포인트는 아직 마이그레이션 대상에 포함되지 않아 로컬 디스크 방식 그대로입니다. 용도가 겹치지 않도록 주의가 필요합니다.

표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 사진 업로드

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/photos/upload \
  -F "file=@/path/to/photo.jpg"
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/photos/upload |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | multipart/form-data |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| file | File | 필수 | 이미지 파일만 허용, 최대 5MB |

파일명은 원본 파일명을 그대로 사용합니다(한글 인코딩 보정, `latin1` → `utf8` 변환). 동일 파일명 업로드 시 기존 파일을 덮어씁니다.

### Response

#### Response Syntax

```json
{
  "filename": "사진.jpg",
  "savedFilename": "사진.jpg",
  "size": 204800,
  "mimetype": "image/jpeg",
  "url": "http://localhost:3000/uploads/photos/사진.jpg"
}
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| filename | String | 필수 | 원본 파일명 |
| savedFilename | String | 필수 | 저장된 파일명(원본과 동일, 인코딩 보정됨) |
| size | Integer | 필수 | 바이트 단위 |
| mimetype | String | 필수 | |
| url | String | 필수 | `{BASE_URL}/uploads/photos/{savedFilename}` (`BASE_URL` 미설정 시 `http://localhost:3000`) |

### 에러

| 상태 코드 | 상황 | 메시지 |
| --- | --- | --- |
| 400 | 파일 없음 | `"File is required"` |
| 400 | 이미지가 아닌 파일 | `"Only image files are allowed"` |
| 400 | 5MB 초과 | Multer 에러로 요청 실패 |
