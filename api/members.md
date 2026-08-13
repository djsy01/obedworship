# Members API

팀원(멤버) 정보와 직책/포지션을 관리합니다. Vision 페이지(`/vision`)가 사용하는 핵심 API입니다. 파일 업로드는 GCS(`StorageService`)를 사용합니다. 표기 규칙은 [README](./README.md#표기-규칙) 참고.

---

## 멤버 전체 조회

### Request Syntax

```bash
curl -X GET "http://{SERVER_URL}/members?active=true"
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/members |

### Request Header

없음

### Query Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| active | String | 선택 | `"true"`인 경우 `is_active=true`인 멤버만 반환 (최우선 적용) |
| affiliation | String | 선택 | 소속 필터. `active`가 없을 때만 적용 |

`active`, `affiliation` 모두 없으면 전체 멤버를 반환합니다.

### Response

#### Response Syntax

```json
[
  {
    "id": 1,
    "name": "홍길동",
    "affiliation": "청년부",
    "photo_url": "https://storage.googleapis.com/.../members/xxx.jpg",
    "instagram_url": null,
    "youtube_url": null,
    "is_active": true,
    "display_order": 0,
    "description": null,
    "user_id": null,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |
| name | String | 필수 | 이름 (최대 100자) |
| affiliation | String | 필수 | `목사` \| `장로` \| `집사` \| `장년부` \| `청년부` \| `고등부` \| `중등부` |
| photo_url | String | 선택 | 프로필 사진 URL |
| instagram_url | String | 선택 | 인스타그램 링크 |
| youtube_url | String | 선택 | 유튜브 링크 |
| is_active | Boolean | 필수 | 활성 여부 (기본값 true) |
| display_order | Integer | 필수 | 정렬 순서 (기본값 0) |
| description | String | 선택 | 소개 |
| user_id | Integer | 선택 | 연결된 `users.id` |
| created_at | String | 필수 | 생성 일시 |
| updated_at | String | 필수 | 수정 일시 |

---

## 멤버 단건 조회

### Request Syntax

```bash
curl -X GET http://{SERVER_URL}/members/1
```

| 메서드 | 요청 URL |
| --- | --- |
| GET | http://{SERVER_URL}/members/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |

### Response

#### Response Syntax

멤버 전체 조회와 동일한 필드에 더해 `member_roles`, `member_teams`, `member_worship_positions`, `member_step_positions` 관계가 포함될 수 있습니다(서비스 구현에 따름).

#### Response Elements

[멤버 전체 조회](#멤버-전체-조회)의 Response Elements 참고

---

## 멤버 생성

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/members \
  -H "Content-Type: application/json" \
  -d '{
        "name": "홍길동",
        "affiliation": "청년부",
        "photo_url": "https://storage.googleapis.com/.../members/xxx.jpg"
      }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/members |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| name | String | 필수 | 최대 100자 |
| affiliation | String | 필수 | `목사` \| `장로` \| `집사` \| `장년부` \| `청년부` \| `고등부` \| `중등부` |
| photo_url | String | 선택 | 최대 500자 |
| instagram_url | String | 선택 | 최대 255자 |
| youtube_url | String | 선택 | 최대 255자 |
| is_active | Boolean | 선택 | |
| display_order | Integer | 선택 | |
| description | String | 선택 | |

### Response

생성된 멤버 객체를 반환합니다. [멤버 전체 조회](#멤버-전체-조회)의 Response Elements 참고 (상태 코드 `201`)

---

## 멤버 사진 업로드

GCS `members/` 폴더에 업로드만 수행합니다. DB 반영은 별도로 [멤버 수정](#멤버-수정)에서 `photo_url`을 지정해야 합니다.

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/members/upload-photo \
  -F "photo=@/path/to/photo.jpg"
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/members/upload-photo |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | multipart/form-data |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| photo | File | 필수 | 이미지 파일만 허용 |

### Response

#### Response Syntax

```json
{ "photo_url": "https://storage.googleapis.com/.../members/xxx.jpg" }
```

#### Response Elements

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| photo_url | String | 필수 | 업로드된 사진 URL |

### 에러

파일이 없거나 이미지가 아니면 `400 Bad Request`

---

## 멤버 수정

### Request Syntax

```bash
curl -X PATCH http://{SERVER_URL}/members/1 \
  -H "Content-Type: application/json" \
  -d '{ "photo_url": "https://storage.googleapis.com/.../members/xxx.jpg" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| PATCH | http://{SERVER_URL}/members/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

[멤버 생성](#멤버-생성)의 Request Elements와 동일한 필드가 모두 선택 사항입니다(변경할 필드만 전송).

### Response

수정된 멤버 객체를 반환합니다. [멤버 전체 조회](#멤버-전체-조회)의 Response Elements 참고

---

## 멤버 삭제

`photo_url`이 있으면 GCS에서도 파일을 함께 삭제합니다(파일 삭제 실패해도 멤버 삭제는 진행).

### Request Syntax

```bash
curl -X DELETE http://{SERVER_URL}/members/1
```

| 메서드 | 요청 URL |
| --- | --- |
| DELETE | http://{SERVER_URL}/members/{id} |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |

### Request Header

없음

### Response

삭제된 멤버 객체를 반환합니다.

---

## 멤버 직책(roles) 일괄 교체

기존 직책을 모두 지우고 전달된 목록으로 교체합니다.

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/members/1/roles \
  -H "Content-Type: application/json" \
  -d '{ "roleTypes": ["Pastor", "Worship Team Leader"] }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/members/{id}/roles |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| roleTypes | String[] | 필수 | `member_roles_role_type` enum 값 배열 (`Pastor`, `Elder`, `Worship Team Leader`, `Accounting Leader`, `Lead Singer`, `Singer Leader`, `Session Leader`, `Planning Leader`, `Media Leader`, `Stage Leader`, `Prayer Leader`) |

### Response

갱신된 직책 목록(`member_roles[]`)을 반환합니다.

---

## 멤버 Worship 포지션 일괄 교체

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/members/1/worship-positions \
  -H "Content-Type: application/json" \
  -d '{ "positionTypes": ["Vocal", "Piano"] }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/members/{id}/worship-positions |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| positionTypes | String[] | 필수 | `member_worship_positions_position_type` enum 값 배열 (`Vocal`, `Piano`, `Synthesizer`, `Acoustic Guitar`, `Lead Guitar`, `Backing Guitar`, `Bass Guitar`, `Drum`) |

### Response

갱신된 포지션 목록(`member_worship_positions[]`)을 반환합니다.

---

## 멤버 Step 포지션 일괄 교체

### Request Syntax

```bash
curl -X POST http://{SERVER_URL}/members/1/step-positions \
  -H "Content-Type: application/json" \
  -d '{ "positionTypes": ["Media Team", "Camera Operator"] }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/members/{id}/step-positions |

### Path Parameters

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 멤버 고유 번호 |

### Request Header

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| Content-Type | String | 필수 | application/json |

### Request Elements

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| positionTypes | String[] | 필수 | `member_step_positions_position_type` enum 값 배열 (`Accounting Team`, `Planning Team`, `Instagram Manager`, `Poster Designer`, `Guidebook Designer`, `Media Team`, `Camera Operator`, `Video Editor`, `YouTube Manager`, `Mix Engineer`, `Master Engineer`, `Music Producer`, `Stage Team`, `Stage Designer`, `Live Engineer`, `Lighting Operator`, `Audio Setup`, `Preproduction`, `Prayer Team`) |

### Response

갱신된 포지션 목록(`member_step_positions[]`)을 반환합니다.

---

## 하위 리소스: 개별 CRUD 컨트롤러

`member-roles`, `member-teams`, `member-worship-positions`, `member-step-positions`는 위 일괄 교체 API와 별도로 레코드 단위 CRUD를 제공합니다. Vision 페이지의 멤버 편집(`MemberEditModal`)은 주로 `POST /members/:id/roles` 등 일괄 교체 API를 사용하며, 아래 개별 CRUD는 관리 도구/향후 확장을 위해 노출되어 있습니다.

### member-roles

`member_id` + `role_type` 조합은 유일해야 합니다.

#### 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/member-roles \
  -H "Content-Type: application/json" \
  -d '{ "member_id": 1, "role_type": "Pastor", "role_order": 1 }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/member-roles |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| role_type | String | 필수 | `member_roles_role_type` enum |
| role_order | Integer | 필수 | 정렬 순서 |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| role_type | String | 필수 | 직책 |
| role_order | Integer | 선택 | 정렬 순서 (기본값 0) |

#### 전체/단건 조회, 수정, 삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/member-roles | 전체 조회 (`member_roles[]`) |
| GET | http://{SERVER_URL}/member-roles/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/member-roles/{id} | 위 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/member-roles/{id} | 삭제, 삭제된 레코드 반환 |

---

### member-teams

`member_id` + `team_type` + `priority` 조합이 유일해야 합니다.

#### 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/member-teams \
  -H "Content-Type: application/json" \
  -d '{ "member_id": 1, "team_type": "Worship팀", "is_leader": true, "priority": 1 }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/member-teams |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| team_type | String | 필수 | `member_teams_team_type` enum (현재 `Worship팀`만 사용) |
| is_leader | Boolean | 필수 | 팀 리더 여부 |
| priority | Integer | 필수 | 정렬 순서 |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| team_type | String | 필수 | 팀 구분 |
| is_leader | Boolean | 선택 | 기본값 false |
| priority | Integer | 선택 | 기본값 0 |

#### 전체/단건 조회, 수정, 삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/member-teams | 전체 조회 (`member_teams[]`) |
| GET | http://{SERVER_URL}/member-teams/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/member-teams/{id} | 위 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/member-teams/{id} | 삭제, 삭제된 레코드 반환 |

---

### member-worship-positions

`member_id` + `position_type` 조합은 유일해야 합니다.

#### 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/member-worship-positions \
  -H "Content-Type: application/json" \
  -d '{ "member_id": 1, "position_type": "Vocal", "position_order": 1 }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/member-worship-positions |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| position_type | String | 필수 | `member_worship_positions_position_type` enum |
| position_order | Integer | 필수 | 정렬 순서 |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| position_type | String | 필수 | 포지션(악기/보컬) |
| position_order | Integer | 선택 | 기본값 0 |

#### 전체/단건 조회, 수정, 삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/member-worship-positions | 전체 조회 (`member_worship_positions[]`) |
| GET | http://{SERVER_URL}/member-worship-positions/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/member-worship-positions/{id} | 위 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/member-worship-positions/{id} | 삭제, 삭제된 레코드 반환 |

---

### member-step-positions

`member_id` + `position_type` 조합은 유일해야 합니다.

#### 생성

**Request Syntax**

```bash
curl -X POST http://{SERVER_URL}/member-step-positions \
  -H "Content-Type: application/json" \
  -d '{ "member_id": 1, "position_type": "Media Team" }'
```

| 메서드 | 요청 URL |
| --- | --- |
| POST | http://{SERVER_URL}/member-step-positions |

**Request Elements**

| 파라미터 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| position_type | String | 필수 | `member_step_positions_position_type` enum |

**Response Elements**

| 필드 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| id | Integer | 필수 | 레코드 고유 번호 |
| member_id | Integer | 필수 | 멤버 고유 번호 |
| position_type | String | 필수 | 포지션(운영/기획/미디어 등) |

#### 전체/단건 조회, 수정, 삭제

| 메서드 | 요청 URL | 설명 |
| --- | --- | --- |
| GET | http://{SERVER_URL}/member-step-positions | 전체 조회 (`member_step_positions[]`) |
| GET | http://{SERVER_URL}/member-step-positions/{id} | 단건 조회 |
| PATCH | http://{SERVER_URL}/member-step-positions/{id} | 위 생성 필드 중 변경할 필드만 전송 |
| DELETE | http://{SERVER_URL}/member-step-positions/{id} | 삭제, 삭제된 레코드 반환 |
