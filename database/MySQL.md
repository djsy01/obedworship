# MySQL 테이블

> MySQL DB테이블 상세 설명문입니다.

## 데이터베이스 생성 및 선택

```sql
CREATE DATABASE IF NOT EXISTS obed_worship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE obed_worship;
```

---

## DB 테이블 구성

### 1. 집회 정보 테이블

#### 1.1 worship_logs (집회 기본 정보)

```sql
CREATE TABLE worship_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  date VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  preacher VARCHAR(100) NOT NULL,
  worship_team VARCHAR(100) NOT NULL,
  guest VARCHAR(100) DEFAULT NULL,
  description TEXT NOT NULL,
  comments TEXT DEFAULT NULL,
  entry_time VARCHAR(50) DEFAULT NULL,
  start_time VARCHAR(50) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  location_link VARCHAR(500) DEFAULT NULL,
  parking TEXT DEFAULT NULL,
  seating TEXT DEFAULT NULL,
  promo_video VARCHAR(500) DEFAULT NULL,
  prelisten_video VARCHAR(500) DEFAULT NULL,
  excluded_songs JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_year (year),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.2 worship_songs (집회 곡 목록)

```sql
CREATE TABLE worship_songs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worship_id INT NOT NULL,
  category ENUM('opening', 'celebration') NOT NULL,
  song_order INT NOT NULL,
  song_name VARCHAR(200) NOT NULL,

  INDEX idx_worship (worship_id),
  FOREIGN KEY (worship_id) REFERENCES worship_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.3 worship_videos (집회 영상)

```sql
CREATE TABLE worship_videos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worship_id INT NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  video_order INT DEFAULT 1,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_worship (worship_id),
  FOREIGN KEY (worship_id) REFERENCES worship_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.4 worship_photos (집회 사진)

```sql
CREATE TABLE worship_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worship_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT DEFAULT NULL,
  photo_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_worship (worship_id),
  FOREIGN KEY (worship_id) REFERENCES worship_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.5 worship_scores (집회 악보)

```sql
CREATE TABLE worship_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worship_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INT DEFAULT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(50) DEFAULT NULL,

  INDEX idx_worship (worship_id),
  FOREIGN KEY (worship_id) REFERENCES worship_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. 악보 정보 테이블

#### 2.1 scores (자작곡 & 편곡 악보)

```sql
CREATE TABLE scores (
  id INT PRIMARY KEY AUTO_INCREMENT,

  -- 기본 정보
  title VARCHAR(200) NOT NULL COMMENT '곡 제목',
  song_key VARCHAR(10) NOT NULL COMMENT '조(Key): C, D, E, F, G, A, B 및 #, b',
  bpm INT NOT NULL COMMENT '템포(분당 박자수)',
  category VARCHAR(100) NOT NULL COMMENT '카테고리/집회명',

  -- 파일 정보
  file_url VARCHAR(500) NOT NULL COMMENT '악보 파일 URL (PDF)',
  filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
  file_size INT DEFAULT NULL COMMENT '파일 크기(bytes)',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT '썸네일 이미지 URL',

  -- 곡 상세 정보
  description TEXT DEFAULT NULL COMMENT '곡 설명',
  composer VARCHAR(100) DEFAULT NULL COMMENT '작곡가',
  arranger VARCHAR(100) DEFAULT NULL COMMENT '편곡자',
  original_song VARCHAR(200) DEFAULT NULL COMMENT '원곡명 (편곡인 경우)',
  is_original BOOLEAN DEFAULT TRUE COMMENT '자작곡 여부',
  copyright_info TEXT DEFAULT NULL COMMENT '저작권 정보',

  -- 메타데이터
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  uploaded_by VARCHAR(50) DEFAULT NULL COMMENT '업로더 userId (Redis 연동)',
  download_count INT DEFAULT 0 COMMENT '다운로드 횟수',
  is_public BOOLEAN DEFAULT TRUE COMMENT '공개 여부',

  -- 인덱스
  INDEX idx_key (song_key),
  INDEX idx_category (category),
  INDEX idx_bpm (bpm),
  INDEX idx_title (title),
  INDEX idx_created_at (created_at),
  INDEX idx_is_original (is_original),
  FULLTEXT INDEX ft_title (title) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2.2 score_downloads (악보 다운로드 기록)

```sql
CREATE TABLE score_downloads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  score_id INT NOT NULL,
  user_id VARCHAR(50) NOT NULL COMMENT '다운로드한 사용자 userId (Redis 연동)',
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IPv4/IPv6 주소',
  user_agent TEXT DEFAULT NULL COMMENT '브라우저 정보',

  INDEX idx_score (score_id),
  INDEX idx_user (user_id),
  INDEX idx_downloaded_at (downloaded_at),
  FOREIGN KEY (score_id) REFERENCES scores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. 사용자 테이블

#### 3.1 users (사용자)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'member', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20) DEFAULT NULL,
  profile_photo_url VARCHAR(500) DEFAULT NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. 멤버 정보 테이블

#### 4.1 members (팀원 기본 정보)

```sql
CREATE TABLE members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '이름',
  affiliation ENUM('목사', '장로', '집사', '영유아', '청소년', '청년', '장년') NOT NULL COMMENT '소속',

  -- SNS 및 미디어
  photo_url VARCHAR(500) DEFAULT NULL COMMENT '프로필 사진 URL',
  instagram_url VARCHAR(255) DEFAULT NULL COMMENT '인스타그램 URL',
  youtube_url VARCHAR(255) DEFAULT NULL COMMENT '유튜브 URL',

  -- 메타데이터
  is_active BOOLEAN DEFAULT TRUE COMMENT '활동 여부',
  display_order INT DEFAULT 0 COMMENT '표시 순서',
  description TEXT DEFAULT NULL COMMENT '팀원 설명',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_affiliation (affiliation),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4.2 member_teams (멤버 팀)

```sql
CREATE TABLE member_teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  team_type ENUM(
    '총괄팀',
    'Worship팀',     -- 싱어 + 세션 통합
    '회계팀',
    '홍보팀',
    '영상팀',
    '무대팀',
    '기도팀'
  ) NOT NULL COMMENT '팀 분류',
  is_leader BOOLEAN DEFAULT FALSE COMMENT '팀장 여부',
  priority INT DEFAULT 0 COMMENT '우선순위 (1=주팀, 2,3=부팀)',

  INDEX idx_member (member_id),
  INDEX idx_team (team_type),
  INDEX idx_leader (is_leader),
  UNIQUE KEY unique_member_team_priority (member_id, team_type, priority),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4.3 member_roles (리더 역할 - Leader 필터용)

```sql
CREATE TABLE member_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  role_type ENUM(
    'Pastor',               -- 목사
    'Elder',                -- 장로
    'Worship Team Leader',  -- 팀 리더
    'Accounting Leader',    -- 회계팀장
    'Lead Singer',          -- 인도자
    'Singer Leader',        -- 싱어팀장
    'Session Leader',       -- 세션팀장
    'Planning Leader',      -- 홍보팀장
    'Media Leader',         -- 미디어팀장
    'Stage Leader',         -- 무대팀장
    'Prayer Leader'         -- 기도팀장
  ) NOT NULL COMMENT '리더 역할',
  role_order INT DEFAULT 0 COMMENT '역할 표시 순서',

  INDEX idx_member (member_id),
  INDEX idx_role (role_type),
  INDEX idx_order (role_order),
  UNIQUE KEY unique_member_role (member_id, role_type),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4.4 member_worship_positions (Worship 포지션 - 싱어 + 세션)

```sql
CREATE TABLE member_worship_positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  position_type ENUM(
    'Vocal',               -- 보컬
    'Piano',               -- 메인 건반
    'Synthesizer',         -- 세컨 건반
    'Acoustic Guitar',     -- 어쿠스틱 기타
    'Lead Guitar',         -- 리드 기타
    'Backing Guitar',      -- 백킹 기타
    'Bass Guitar',         -- 베이스 기타
    'Drum'                 -- 드럼
  ) NOT NULL COMMENT 'Worship 포지션',
  position_order INT DEFAULT 0 COMMENT '포지션 정렬 순서 (Vocal=1, Piano=2, ...)',

  INDEX idx_member (member_id),
  INDEX idx_position (position_type),
  INDEX idx_position_order (position_order),
  UNIQUE KEY unique_member_worship_position (member_id, position_type),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4.5 member_step_positions (Step 포지션 - 홍보팀, 영상팀, 무대팀 세부 역할)

```sql
CREATE TABLE member_step_positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  position_type ENUM(
    -- 회계팀 (Accounting Team)
    'Accounting Team',

    -- 홍보팀 (Planning Team) - 인스타, 포스터 디자인, 예배안내지
    'Planning Team',
    'Instagram Manager',   -- 인스타그램 관리자
    'Poster Designer',     -- 포스터
    'Guidebook Designer',  -- 예배안내 책자

    -- 미디어팀 (Media Team) - 촬영, 편집, 후반 작업
    'Media Team',
    'Camera Operator',     -- 카메라 관리자
    'Video Editor',        -- 영상 편집
    'YouTube Manager',     -- 유튜브 관리자
    'Mix Engineer',        -- 믹싱 엔지니어
    'Master Engineer',     -- 마스터링
    'Music Producer',      -- 음악 프로듀서

    -- 무대팀 (Stage Team) - 현장 음향, 조명, 무대
    'Stage Team',
    'Stage Designer',      -- 무대 구상
    'Live Engineer',       -- 라이브 엔지니어
    'Lighting Operator',   -- 조명 관리자
    'Audio Setup',         -- 음향 세팅
    'Preproduction',       -- 프리프로덕션

    -- 기도팀 (Prayer Team)
    'Prayer Team'
  ) NOT NULL COMMENT 'Step 포지션',

  INDEX idx_member (member_id),
  INDEX idx_position (position_type),
  UNIQUE KEY unique_member_step_position (member_id, position_type),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. Q&A 정보 테이블

#### 5.1 qna (질문 및 답변)

```sql
CREATE TABLE qna (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL COMMENT 'Redis userId (질문자)',
  category ENUM('집회', '악보', '기타') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  answer TEXT DEFAULT NULL COMMENT '관리자 답변',
  answer_date DATETIME DEFAULT NULL COMMENT '답변 작성 날짜',
  status ENUM('WAITING', 'ANSWERED') DEFAULT 'WAITING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. 집회 신청(티켓) 테이블

#### 6.1 tickets (집회 신청용 티켓)

```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worship_id INT DEFAULT NULL COMMENT 'worship_logs 연결 (선택적)',
  title VARCHAR(200) NOT NULL COMMENT '집회명',
  date VARCHAR(50) NOT NULL COMMENT '날짜',
  year INT NOT NULL COMMENT '연도',
  poster_url VARCHAR(500) DEFAULT NULL COMMENT '포스터 이미지 URL',
  place VARCHAR(255) DEFAULT NULL COMMENT '장소',
  preacher VARCHAR(100) DEFAULT NULL COMMENT '설교자',
  description TEXT DEFAULT NULL COMMENT '집회 설명',
  status ENUM('OPEN', 'CLOSED', 'CANCELED') DEFAULT 'OPEN' COMMENT '상태',
  max_capacity INT DEFAULT NULL COMMENT '최대 수용 인원',
  application_deadline DATETIME DEFAULT NULL COMMENT '신청 마감일',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_worship (worship_id),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_year (year),
  FOREIGN KEY (worship_id) REFERENCES worship_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6.2 ticket_applications (티켓 신청 내역)

```sql
CREATE TABLE ticket_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL COMMENT '티켓 ID',
  user_id INT NOT NULL COMMENT '신청자 사용자 ID',
  applicant_name VARCHAR(100) NOT NULL COMMENT '신청자 이름',
  applicant_phone VARCHAR(20) NOT NULL COMMENT '신청자 연락처',
  applicant_email VARCHAR(255) DEFAULT NULL COMMENT '신청자 이메일',
  party_size INT DEFAULT 1 COMMENT '인원수',
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING' COMMENT '신청 상태',
  payment_status ENUM('UNPAID', 'PAID', 'FREE') DEFAULT 'UNPAID' COMMENT '결제 상태',
  memo TEXT DEFAULT NULL COMMENT '메모',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_ticket (ticket_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 테이블 관계도

```text
worship_logs (집회 안내)
  ├─ worship_songs        [ON DELETE CASCADE]
  ├─ worship_videos       [ON DELETE CASCADE]
  ├─ worship_photos       [ON DELETE CASCADE]
  ├─ worship_scores       [ON DELETE CASCADE]
  └─ tickets              [ON DELETE SET NULL] (선택적 연결)

tickets (집회 신청)
  └─ ticket_applications  [ON DELETE CASCADE]

users (사용자)
  ├─ members              [ON DELETE SET NULL]
  └─ ticket_applications  [ON DELETE CASCADE]

scores (악보)
  └─ score_downloads      [ON DELETE CASCADE]

members (멤버)
  ├─ member_teams         [ON DELETE CASCADE]
  ├─ member_roles         [ON DELETE CASCADE]
  ├─ member_worship_positions [ON DELETE CASCADE]
  └─ member_step_positions    [ON DELETE CASCADE]

qna (Q&A)
  └─ (독립 테이블)
```

### 집회 안내 vs 집회 신청 분리

- **worship_logs**: 집회 안내 페이지 전용 (상세 정보, 영상, 사진, 악보)
- **tickets**: 집회 신청 페이지 전용 (신청 상태, 마감일, 인원 관리)
- tickets.worship_id로 선택적 연결 가능 (집회 안내에서 id, title, date, poster_url 참조)

---

## Redis와의 연동

### Redis → MySQL

```text
Redis의 user:user_001
        ↓
MySQL의 worship_logs.created_by = "user_001"
MySQL의 scores.uploaded_by = "user_001"
MySQL의 qna.user_id = "user_001"
```

- Redis에 있는 `userId`를 MySQL의 관련 필드에 문자열로 저장
- FK 제약조건은 없음 (Redis와 MySQL 분리)
- Redis에서 사용자 정보 관리, MySQL에서 컨텐츠 관리

---

## 주요 특징

### 1. 정규화된 구조

- 집회 정보를 메인 테이블과 관련 테이블로 분리
- 멤버 정보를 역할/팀/포지션별로 세분화
- 다대다 관계를 중간 테이블로 처리

### 2. CASCADE 설정

- 집회 삭제 시 관련 곡/영상/사진/악보 자동 삭제
- 멤버 삭제 시 관련 팀/역할/포지션 정보 자동 삭제
- 데이터 정합성 보장

### 3. 인덱스 최적화

- 검색 빈도가 높은 컬럼에 INDEX 추가
- FULLTEXT INDEX (ngram) 한글 검색 지원
- 복합 UNIQUE KEY로 중복 방지

### 4. 유연한 구조

- ENUM 타입으로 카테고리 관리
- JSON 타입으로 유연한 데이터 저장 (excluded_songs)
- DEFAULT NULL로 선택적 필드 지원

---

## 테이블 생성 확인

```sql
SHOW TABLES;
```

---

## 각 테이블 구조 확인

```sql
DESCRIBE worship_logs;
DESCRIBE worship_songs;
DESCRIBE worship_videos;
DESCRIBE worship_photos;
DESCRIBE worship_scores;
DESCRIBE scores;
DESCRIBE score_downloads;
DESCRIBE members;
DESCRIBE member_teams;
DESCRIBE member_roles;
DESCRIBE member_worship_positions;
DESCRIBE member_step_positions;
DESCRIBE qna;
```

---

## 향후 확장 계획

- [x] 티켓팅 시스템 테이블 추가 (tickets, ticket_applications)
- [ ] 알림(notification) 테이블 추가
- [ ] 파일 메타데이터 테이블 추가 (실제 파일 업로드 시)
- [ ] 통계 및 분석 테이블 추가
