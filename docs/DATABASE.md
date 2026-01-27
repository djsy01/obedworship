# 📊 OBED Worship - Database Schema

> MySQL 데이터베이스 스키마 및 구조 문서

---

## 데이터베이스 정보

- **DBMS**: MySQL
- **ORM**: Prisma 6.19.2
- **인코딩**: UTF-8
- **환경변수**: `DATABASE_URL`

---

## 테이블 구조

### 1. Members (팀원 관리)

#### `members` - 팀원 기본 정보
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 팀원 ID |
| name | VARCHAR(100) | NOT NULL | 이름 |
| affiliation | ENUM | NOT NULL | 소속 (목사/장로/집사/장년부/청년부/고등부/중등부) |
| user_id | INT | NULL | users.id 연결 (선택) |
| photo_url | VARCHAR(500) | NULL | 프로필 사진 URL |
| instagram_url | VARCHAR(255) | NULL | 인스타그램 URL |
| youtube_url | VARCHAR(255) | NULL | 유튜브 URL |
| is_active | BOOLEAN | DEFAULT true | 활동 상태 |
| display_order | INT | DEFAULT 0 | 표시 순서 |
| description | TEXT | NULL | 소개 |
| created_at | TIMESTAMP | DEFAULT NOW | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW | 수정일시 |

**인덱스**:
- `idx_affiliation` (affiliation)
- `idx_display_order` (display_order)
- `idx_is_active` (is_active)
 - `idx_user_id` (user_id)

---

#### `member_roles` - 팀원 역할
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 역할 ID |
| member_id | INT | FK, NOT NULL | 팀원 ID |
| role_type | ENUM | NOT NULL | 역할 타입 |
| role_order | INT | DEFAULT 0 | 역할 순서 |

**역할 타입 (role_type)**:
- Pastor (목사)
- Elder (장로)
- Worship Team Leader (워십팀 리더)
- Accounting Leader (회계 리더)
- Lead Singer (리드 싱어)
- Singer Leader (싱어 리더)
- Session Leader (세션 리더)
- Planning Leader (기획 리더)
- Media Leader (미디어 리더)
- Stage Leader (무대 리더)
- Prayer Leader (기도 리더)

**제약조건**:
- UNIQUE(member_id, role_type)
- CASCADE DELETE

**인덱스**:
- `idx_member` (member_id)
- `idx_role` (role_type)
- `idx_order` (role_order)

---

#### `member_worship_positions` - 워십 포지션
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 포지션 ID |
| member_id | INT | FK, NOT NULL | 팀원 ID |
| position_type | ENUM | NOT NULL | 포지션 타입 |
| position_order | INT | DEFAULT 0 | 포지션 순서 |

**포지션 타입 (position_type)**:
- Vocal
- Piano
- Synthesizer
- Acoustic Guitar
- Lead Guitar
- Backing Guitar
- Bass Guitar
- Drum

**제약조건**:
- UNIQUE(member_id, position_type)
- CASCADE DELETE

---

#### `member_step_positions` - Step 포지션
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 포지션 ID |
| member_id | INT | FK, NOT NULL | 팀원 ID |
| position_type | ENUM | NOT NULL | 포지션 타입 |

**포지션 타입 (position_type)**:
- Accounting Team (회계팀)
- Planning Team (기획팀)
- Instagram Manager
- Poster Designer
- Guidebook Designer
- Media Team (미디어팀)
- Camera Operator
- Video Editor
- YouTube Manager
- Mix Engineer
- Master Engineer
- Music Producer
- Stage Team (무대팀)
- Stage Designer
- Live Engineer
- Lighting Operator
- Audio Setup
- Preproduction
- Prayer Team (기도팀)

**제약조건**:
- UNIQUE(member_id, position_type)
- CASCADE DELETE

---

#### `member_teams` - 팀 소속
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 팀 ID |
| member_id | INT | FK, NOT NULL | 팀원 ID |
| team_type | ENUM | NOT NULL | 팀 타입 |
| is_leader | BOOLEAN | DEFAULT false | 리더 여부 |
| priority | INT | DEFAULT 0 | 우선순위 |

**팀 타입 (team_type)**:
- 총괄팀
- Worship팀
- 회계팀
- 홍보팀
- 영상팀
- 무대팀
- 기도팀

**제약조건**:
- UNIQUE(member_id, team_type, priority)
- CASCADE DELETE

**인덱스**:
- `idx_member` (member_id)
- `idx_team` (team_type)
- `idx_leader` (is_leader)

---

### 2. Worship Logs (집회 관리)

#### `worship_logs` - 집회 기본 정보
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 집회 ID |
| title | VARCHAR(200) | NOT NULL | 집회 제목 |
| date | VARCHAR(50) | NOT NULL | 집회 날짜 |
| year | INT | NOT NULL | 연도 |
| preacher | VARCHAR(100) | NOT NULL | 설교자 |
| worship_team | VARCHAR(100) | NOT NULL | 워십팀 |
| guest | VARCHAR(100) | NULL | 게스트 |
| description | TEXT | NOT NULL | 집회 설명 |
| poster_url | VARCHAR(500) | NULL | 포스터 이미지 URL |
| comments | TEXT | NULL | 추가 안내사항 |
| entry_time | VARCHAR(50) | NULL | 입장 시간 |
| start_time | VARCHAR(50) | NULL | 시작 시간 |
| location | VARCHAR(255) | NULL | 장소 |
| location_link | VARCHAR(500) | NULL | 장소 링크 (지도) |
| parking | TEXT | NULL | 주차 안내 |
| seating | TEXT | NULL | 좌석 안내 |
| promo_video | VARCHAR(500) | NULL | 홍보 영상 URL |
| prelisten_video | VARCHAR(500) | NULL | 미리듣기 영상 URL |
| excluded_songs | JSON | NULL | 저작권으로 제외된 곡 목록 |
| created_at | TIMESTAMP | DEFAULT NOW | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW | 수정일시 |

**인덱스**:
- `idx_date` (date)
- `idx_year` (year)

---

#### `worship_songs` - 집회 곡 목록
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 곡 ID |
| worship_id | INT | FK, NOT NULL | 집회 ID |
| category | ENUM | NOT NULL | 카테고리 (opening/celebration) |
| song_order | INT | NOT NULL | 곡 순서 |
| song_name | VARCHAR(200) | NOT NULL | 곡 제목 |

**제약조건**:
- CASCADE DELETE
- category: 'opening' (오프닝), 'celebration' (찬양)

**인덱스**:
- `idx_worship` (worship_id)

---

#### `worship_videos` - 집회 영상
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 영상 ID |
| worship_id | INT | FK, NOT NULL | 집회 ID |
| video_url | VARCHAR(500) | NOT NULL | 영상 URL (YouTube) |
| video_order | INT | DEFAULT 1 | 영상 순서 |
| uploaded_at | TIMESTAMP | DEFAULT NOW | 업로드일시 |

**제약조건**:
- CASCADE DELETE

**인덱스**:
- `idx_worship` (worship_id)

---

#### `worship_photos` - 집회 사진
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 사진 ID |
| worship_id | INT | FK, NOT NULL | 집회 ID |
| photo_url | VARCHAR(500) | NOT NULL | 사진 URL |
| thumbnail_url | VARCHAR(500) | NULL | 썸네일 URL |
| file_name | VARCHAR(255) | NOT NULL | 파일명 |
| file_size | INT | NULL | 파일 크기 (bytes) |
| photo_order | INT | DEFAULT 0 | 사진 순서 |
| uploaded_at | TIMESTAMP | DEFAULT NOW | 업로드일시 |

**제약조건**:
- CASCADE DELETE

**인덱스**:
- `idx_worship` (worship_id)

---

#### `worship_scores` - 집회 악보
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 악보 ID |
| worship_id | INT | FK, NOT NULL | 집회 ID |
| filename | VARCHAR(255) | NOT NULL | 파일명 |
| file_url | VARCHAR(500) | NOT NULL | 파일 URL |
| file_size | INT | NULL | 파일 크기 (bytes) |
| thumbnail_url | VARCHAR(500) | NULL | 썸네일 URL (포스터) |
| description | TEXT | NULL | 악보 설명 |
| uploaded_at | TIMESTAMP | DEFAULT NOW | 업로드일시 |
| uploaded_by | INT | NULL | 업로드한 사용자 ID (향후 users.id FK) |

**제약조건**:
- CASCADE DELETE

**인덱스**:
- `idx_worship` (worship_id)
- `idx_uploaded_by` (uploaded_by)

---

### 3. Scores (악보 라이브러리)

#### `scores` - 악보 정보
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 악보 ID |
| title | VARCHAR(200) | NOT NULL | 곡 제목 |
| song_key | VARCHAR(10) | NOT NULL | 조성 (Key) |
| bpm | INT | NOT NULL | BPM |
| category | VARCHAR(100) | NOT NULL | 카테고리 |
| file_url | VARCHAR(500) | NOT NULL | 파일 URL |
| filename | VARCHAR(255) | NOT NULL | 파일명 |
| file_size | INT | NULL | 파일 크기 (bytes) |
| thumbnail_url | VARCHAR(500) | NULL | 썸네일 URL |
| description | TEXT | NULL | 악보 설명 |
| composer | VARCHAR(100) | NULL | 작곡가 |
| arranger | VARCHAR(100) | NULL | 편곡자 |
| original_song | VARCHAR(200) | NULL | 원곡 제목 |
| is_original | BOOLEAN | DEFAULT true | 자체 편곡 여부 |
| copyright_info | TEXT | NULL | 저작권 정보 |
| created_at | TIMESTAMP | DEFAULT NOW | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW | 수정일시 |
| uploaded_by | INT | NULL | 업로드한 사용자 ID (향후 users.id FK) |
| download_count | INT | DEFAULT 0 | 다운로드 횟수 |
| is_public | BOOLEAN | DEFAULT true | 공개 여부 |

**인덱스**:
- `idx_title` (title)
- `idx_key` (song_key)
- `idx_bpm` (bpm)
- `idx_uploaded_by` (uploaded_by)
- `idx_category` (category)
- `idx_is_original` (is_original)
- `idx_created_at` (created_at)
- `ft_title` (FULLTEXT on title)

---

#### `score_downloads` - 악보 다운로드 기록
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 다운로드 ID |
| score_id | INT | FK, NOT NULL | 악보 ID |
| user_id | INT | NOT NULL | 사용자 ID (향후 users.id FK) |
| downloaded_at | TIMESTAMP | DEFAULT NOW | 다운로드일시 |
| ip_address | VARCHAR(45) | NULL | IP 주소 |
| user_agent | TEXT | NULL | User Agent |

**제약조건**:
- CASCADE DELETE

**인덱스**:
- `idx_score` (score_id)
- `idx_user` (user_id)
- `idx_downloaded_at` (downloaded_at)

---

### 4. QnA (질문 및 답변)

#### `qna` - Q&A
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | Q&A ID |
| user_id | INT | NOT NULL | 작성자 ID (향후 users.id FK) |
| category | ENUM | NOT NULL | 카테고리 (집회/악보/기타) |
| title | VARCHAR(200) | NOT NULL | 제목 |
| content | TEXT | NOT NULL | 질문 내용 |
| answer | TEXT | NULL | 답변 내용 |
| answer_date | DATETIME | NULL | 답변일시 |
| status | ENUM | DEFAULT WAITING | 상태 (WAITING/ANSWERED) |
| created_at | TIMESTAMP | DEFAULT NOW | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW | 수정일시 |

**인덱스**:
- `idx_user` (user_id)
- `idx_category` (category)
- `idx_status` (status)
- `idx_created_at` (created_at)

---

## Prisma 설정

### Schema 파일 위치
```
prisma/schema.prisma
```

### 주요 명령어

#### 스키마 동기화
```bash
npx prisma db push
```

#### 마이그레이션 생성
```bash
npx prisma migrate dev --name <migration_name>
```

#### 마이그레이션 적용 (프로덕션)
```bash
npx prisma migrate deploy
```

#### Prisma Studio (GUI)
```bash
npx prisma studio
```

#### Prisma Client 재생성
```bash
npx prisma generate
```

---

## 환경 변수 설정

### `.env` 파일
```env
DATABASE_URL="mysql://user:password@host:port/database"
```

### Railway 배포 시
```env
DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
```

---

## 관계 (Relations)

### Members → Roles/Positions/Teams
- 1:N 관계
- CASCADE DELETE (팀원 삭제 시 관련 역할/포지션/팀 정보 모두 삭제)

### Worship Logs → Songs/Videos/Photos/Scores
- 1:N 관계
- CASCADE DELETE (집회 삭제 시 관련 곡/영상/사진/악보 모두 삭제)

### Scores → Downloads
- 1:N 관계
- CASCADE DELETE (악보 삭제 시 다운로드 기록 모두 삭제)

---

## 주요 쿼리 최적화

### 인덱스 전략
1. **외래키**: 모든 FK 필드에 인덱스 자동 생성
2. **검색 필드**: title, category, status 등
3. **정렬 필드**: created_at, display_order, song_order 등
4. **필터 필드**: year, is_active, is_public 등
5. **풀텍스트 검색**: scores.title (한글 지원)

### 복합 유니크 인덱스
- `member_roles`: (member_id, role_type)
- `member_worship_positions`: (member_id, position_type)
- `member_step_positions`: (member_id, position_type)
- `member_teams`: (member_id, team_type, priority)

---

## 데이터 타입 가이드

### 문자열
- 짧은 텍스트 (< 100자): VARCHAR(100)
- 중간 텍스트 (< 500자): VARCHAR(500)
- 긴 텍스트: TEXT

### 숫자
- ID, 카운트: INT
- 순서, 우선순위: INT (DEFAULT 0)

### 시간
- 생성/수정일시: TIMESTAMP (DEFAULT NOW)
- 특정 일시: DATETIME

### 불린
- 플래그: BOOLEAN (DEFAULT true/false)

### JSON
- 배열 데이터: JSON (excluded_songs)

---

## 백업 및 복구

### 백업
```bash
mysqldump -u user -p database > backup.sql
```

### 복구
```bash
mysql -u user -p database < backup.sql
```

---

## Tickets (집회 신청)

#### `tickets` - 집회 신청용 티켓
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 티켓 ID |
| title | VARCHAR(200) | NOT NULL | 집회명 |
| date | VARCHAR(50) | NOT NULL | 날짜 |
| year | INT | NOT NULL | 연도 |
| price_infant | INT | DEFAULT 0 | 영유아 가격 |
| price_teen | INT | DEFAULT 0 | 청소년 가격 |
| price_military | INT | DEFAULT 0 | 군인 가격 |
| price_adult | INT | DEFAULT 0 | 어른 가격 |
| status | ENUM | DEFAULT OPEN | 상태 |

#### `ticket_applications` - 티켓 신청 내역
| 필드명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | INT | PK, AI | 신청 ID |
| ticket_id | INT | FK | 티켓 ID |
| user_id | INT | FK | 사용자 ID |
| party_size | INT | DEFAULT 1 | 인원 |
| status | ENUM | DEFAULT PENDING | 상태 |

---

## 참고 문서
- [Prisma Documentation](https://www.prisma.io/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
