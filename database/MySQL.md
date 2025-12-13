# MySQL 테이블
> MySQL DB테이블 상세 설명문입니다.

## 데이터베이스 생성 및 선택
```sql
CREATE DATABASE IF NOT EXISTS obed_worship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE obed_worship;
```

---

## DB 테이블 구성
### 1. worship_logs (집회 기본 정보)
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

### 2. worship_songs (집회 곡 목록)
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

### 3. worship_videos (집회 영상)
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

### 4. worship_photos (집회 사진)
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

### 5. worship_scores (집회 악보)
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

### 6. scores (자작곡 & 편곡 악보)
```sql
CREATE TABLE scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- 기본 정보
  title VARCHAR(200) NOT NULL COMMENT '곡 제목',
  song_key VARCHAR(10) NOT NULL COMMENT '조(Key): C, D, E, F, G, A, B 및 b',
  bpm INT NOT NULL COMMENT '템포(분당 박자수)',
  category VARCHAR(100) NOT NULL COMMENT '카테고리/집회명 (예: 하나됨집회 2025-03-22)',
  
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
  is_original BOOLEAN DEFAULT TRUE COMMENT '자작곡 여부 (TRUE: 자작곡, FALSE: 편곡)',
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

### score_download (악보 다운로드 기록)
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
```