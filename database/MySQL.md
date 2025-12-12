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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50) DEFAULT NULL,
  
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
```