# 🐬 OBED Worship - MySQL Setup Guide

> MySQL 데이터베이스 설치, 설정 및 운영 가이드

---

## 시스템 요구사항

- **MySQL 버전**: 8.0 이상 권장
- **운영체제**: macOS, Linux, Windows
- **최소 메모리**: 512MB
- **권장 메모리**: 2GB 이상

---

## 설치

### macOS (Homebrew)

```bash
# MySQL 설치
brew install mysql

# MySQL 서비스 시작
brew services start mysql

# 초기 보안 설정
mysql_secure_installation
```

---

### Ubuntu/Debian

```bash
# 패키지 업데이트
sudo apt update

# MySQL 설치
sudo apt install mysql-server

# MySQL 서비스 시작
sudo systemctl start mysql
sudo systemctl enable mysql

# 초기 보안 설정
sudo mysql_secure_installation
```

---

### Windows

1. [MySQL 공식 사이트](https://dev.mysql.com/downloads/installer/)에서 설치 프로그램 다운로드
2. MySQL Installer 실행
3. "Developer Default" 선택
4. 설치 진행
5. MySQL Workbench로 관리

---

### Docker

```bash
# MySQL 8.0 컨테이너 실행
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=obedworship \
  -p 3306:3306 \
  mysql:8.0

# 컨테이너 접속
docker exec -it mysql mysql -uroot -p
```

---

## 데이터베이스 생성

### 1. MySQL 접속

```bash
mysql -u root -p
```

---

### 2. 데이터베이스 생성

```sql
-- 데이터베이스 생성
CREATE DATABASE obedworship
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 확인
SHOW DATABASES;

-- 데이터베이스 선택
USE obedworship;
```

---

### 3. 사용자 생성 및 권한 부여

```sql
-- 사용자 생성
CREATE USER 'obedadmin'@'localhost' IDENTIFIED BY 'strong_password';

-- 모든 권한 부여
GRANT ALL PRIVILEGES ON obedworship.* TO 'obedadmin'@'localhost';

-- 원격 접속 허용 (필요시)
CREATE USER 'obedadmin'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON obedworship.* TO 'obedadmin'@'%';

-- 권한 적용
FLUSH PRIVILEGES;

-- 사용자 확인
SELECT User, Host FROM mysql.user;
```

---

## 환경 변수 설정

### 로컬 개발 환경

#### `test-server/.env`
```env
DATABASE_URL="mysql://obedadmin:strong_password@localhost:3306/obedworship"
```

---

### Railway 배포 환경

```env
DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
```

Railway에서 MySQL 플러그인 추가 시 자동으로 `DATABASE_URL` 환경변수가 설정됩니다.

---

## Prisma 스키마 적용

### 1. Prisma Client 설치

```bash
cd test-server
npm install @prisma/client
npm install -D prisma
```

---

### 2. 스키마 푸시 (개발 환경)

```bash
npx prisma db push
```

이 명령어는:
- 스키마를 DB에 직접 적용 (마이그레이션 파일 없이)
- 개발 환경에서 빠른 프로토타이핑에 유용

---

### 3. 마이그레이션 (프로덕션 환경)

```bash
# 마이그레이션 파일 생성
npx prisma migrate dev --name init

# 프로덕션 환경에 마이그레이션 적용
npx prisma migrate deploy
```

---

### 4. Prisma Client 생성

```bash
npx prisma generate
```

---

### 5. Prisma Studio 실행 (GUI)

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속

---

## MySQL 설정 파일

### macOS
```
/usr/local/etc/my.cnf
또는
/opt/homebrew/etc/my.cnf
```

### Linux
```
/etc/mysql/my.cnf
또는
/etc/my.cnf
```

### Windows
```
C:\ProgramData\MySQL\MySQL Server 8.0\my.ini
```

---

## 주요 설정

### `my.cnf` 편집

```ini
[mysqld]
# 기본 설정
port=3306
default-storage-engine=InnoDB

# 문자셋 설정 (UTF-8)
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 최대 연결 수
max_connections=200

# 쿼리 캐시 (MySQL 5.7 이하)
query_cache_type=1
query_cache_size=64M

# InnoDB 설정
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
innodb_flush_log_at_trx_commit=2

# 슬로우 쿼리 로그
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow-query.log
long_query_time=2

# 바이너리 로그 (백업용)
log_bin=/var/log/mysql/mysql-bin.log
expire_logs_days=7
max_binlog_size=100M

# 타임존 설정
default-time-zone='+09:00'

[client]
default-character-set=utf8mb4
```

---

## 백업 및 복구

### 1. 전체 백업

```bash
# 데이터만 백업
mysqldump -u obedadmin -p obedworship > backup_$(date +%Y%m%d).sql

# 구조와 데이터 모두 백업
mysqldump -u obedadmin -p --routines --triggers obedworship > full_backup_$(date +%Y%m%d).sql

# 압축 백업
mysqldump -u obedadmin -p obedworship | gzip > backup_$(date +%Y%m%d).sql.gz
```

---

### 2. 특정 테이블만 백업

```bash
mysqldump -u obedadmin -p obedworship worship_logs worship_songs > worship_backup.sql
```

---

### 3. 복구

```bash
# 일반 복구
mysql -u obedadmin -p obedworship < backup_20240122.sql

# 압축 파일 복구
gunzip < backup_20240122.sql.gz | mysql -u obedadmin -p obedworship
```

---

### 4. 자동 백업 스크립트

#### `backup.sh`
```bash
#!/bin/bash

# 설정
DB_USER="obedadmin"
DB_PASS="strong_password"
DB_NAME="obedworship"
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 백업 실행
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

#### crontab 등록 (매일 새벽 3시)
```bash
crontab -e

# 다음 라인 추가
0 3 * * * /path/to/backup.sh
```

---

## 데이터베이스 관리

### 1. 테이블 확인

```sql
-- 모든 테이블 조회
SHOW TABLES;

-- 테이블 구조 확인
DESCRIBE members;
SHOW CREATE TABLE members;

-- 테이블 크기 확인
SELECT
  TABLE_NAME,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'obedworship'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

### 2. 인덱스 관리

```sql
-- 인덱스 확인
SHOW INDEX FROM members;

-- 인덱스 생성
CREATE INDEX idx_name ON members(name);

-- 복합 인덱스
CREATE INDEX idx_name_affiliation ON members(name, affiliation);

-- 인덱스 삭제
DROP INDEX idx_name ON members;

-- 인덱스 사용 통계
SELECT * FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'obedworship';
```

---

### 3. 쿼리 성능 분석

```sql
-- 쿼리 실행 계획 확인
EXPLAIN SELECT * FROM worship_logs WHERE year = 2024;

-- 상세 실행 계획
EXPLAIN FORMAT=JSON SELECT * FROM worship_logs WHERE year = 2024;

-- 프로파일링 활성화
SET profiling = 1;

-- 쿼리 실행
SELECT * FROM scores WHERE song_key = 'C' AND bpm > 120;

-- 프로파일링 결과 확인
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

---

### 4. 슬로우 쿼리 분석

```bash
# 슬로우 쿼리 로그 위치 확인
mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query_log_file';"

# 슬로우 쿼리 로그 분석
mysqldumpslow /var/log/mysql/slow-query.log

# 상위 10개 슬로우 쿼리
mysqldumpslow -t 10 /var/log/mysql/slow-query.log
```

---

## 성능 최적화

### 1. InnoDB 버퍼 풀 크기 조정

```sql
-- 현재 설정 확인
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- 권장: 전체 메모리의 70-80%
-- my.cnf에서 설정
innodb_buffer_pool_size=4G
```

---

### 2. 쿼리 캐시 (MySQL 5.7 이하)

```sql
-- 쿼리 캐시 상태 확인
SHOW VARIABLES LIKE 'query_cache%';

-- 쿼리 캐시 통계
SHOW STATUS LIKE 'Qcache%';
```

---

### 3. 테이블 최적화

```sql
-- 테이블 최적화
OPTIMIZE TABLE members;

-- 모든 테이블 최적화
mysqlcheck -u obedadmin -p --optimize --all-databases
```

---

### 4. 자동 증가값 재설정

```sql
-- 현재 AUTO_INCREMENT 값 확인
SELECT AUTO_INCREMENT FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'obedworship' AND TABLE_NAME = 'members';

-- AUTO_INCREMENT 값 재설정
ALTER TABLE members AUTO_INCREMENT = 1;
```

---

## 모니터링

### 1. 서버 상태 확인

```sql
-- 전체 상태 확인
SHOW STATUS;

-- 연결 수 확인
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- 업타임 확인
SHOW STATUS LIKE 'Uptime';

-- 쿼리 통계
SHOW STATUS LIKE 'Questions';
SHOW STATUS LIKE 'Queries';
```

---

### 2. 프로세스 확인

```sql
-- 현재 실행 중인 쿼리 확인
SHOW PROCESSLIST;

-- 상세 프로세스 정보
SHOW FULL PROCESSLIST;

-- 특정 프로세스 종료
KILL <process_id>;
```

---

### 3. 데이터베이스 크기 확인

```sql
-- 전체 데이터베이스 크기
SELECT
  SUM(ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2)) AS 'Total Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'obedworship';

-- 테이블별 크기
SELECT
  TABLE_NAME,
  ROUND((DATA_LENGTH) / 1024 / 1024, 2) AS 'Data Size (MB)',
  ROUND((INDEX_LENGTH) / 1024 / 1024, 2) AS 'Index Size (MB)',
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Total Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'obedworship'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

## 보안

### 1. 사용자 권한 관리

```sql
-- 사용자별 권한 확인
SHOW GRANTS FOR 'obedadmin'@'localhost';

-- 특정 권한만 부여
GRANT SELECT, INSERT, UPDATE ON obedworship.* TO 'readonly'@'localhost';

-- 권한 제거
REVOKE DELETE ON obedworship.* FROM 'readonly'@'localhost';
```

---

### 2. 비밀번호 정책

```sql
-- 비밀번호 만료 설정
ALTER USER 'obedadmin'@'localhost' PASSWORD EXPIRE INTERVAL 90 DAY;

-- 비밀번호 변경
ALTER USER 'obedadmin'@'localhost' IDENTIFIED BY 'new_password';
```

---

### 3. 원격 접속 제한

```bash
# my.cnf 편집
bind-address=127.0.0.1
```

---

## 트러블슈팅

### 1. 연결 오류

```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql

# 에러 로그 확인
sudo tail -f /var/log/mysql/error.log
```

---

### 2. 권한 오류

```sql
-- 권한 재설정
GRANT ALL PRIVILEGES ON obedworship.* TO 'obedadmin'@'localhost';
FLUSH PRIVILEGES;
```

---

### 3. 문자셋 오류

```sql
-- 데이터베이스 문자셋 확인
SHOW CREATE DATABASE obedworship;

-- 테이블 문자셋 확인
SHOW CREATE TABLE members;

-- 문자셋 변경
ALTER DATABASE obedworship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE members CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 4. 테이블 복구

```sql
-- 테이블 체크
CHECK TABLE members;

-- 테이블 복구
REPAIR TABLE members;
```

---

## Railway 배포 시 주의사항

### 1. MySQL 플러그인 추가
- Railway 대시보드에서 "New" → "Database" → "Add MySQL" 선택
- 자동으로 `DATABASE_URL` 환경변수 생성됨

### 2. SSL 연결
```env
DATABASE_URL="mysql://user:pass@host:port/db?sslaccept=strict"
```

### 3. 연결 풀 설정
```typescript
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 연결 풀 크기 조정 (Railway는 작은 인스턴스이므로 작게 설정)
// NestJS main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
```

---

## 유용한 쿼리 모음

### 1. 데이터 통계

```sql
-- 집회별 영상 개수
SELECT
  w.title,
  COUNT(wv.id) as video_count
FROM worship_logs w
LEFT JOIN worship_videos wv ON w.id = wv.worship_id
GROUP BY w.id
ORDER BY video_count DESC;

-- 월별 Q&A 통계
SELECT
  DATE_FORMAT(created_at, '%Y-%m') as month,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'ANSWERED' THEN 1 ELSE 0 END) as answered
FROM qna
GROUP BY month
ORDER BY month DESC;

-- 인기 악보 Top 10
SELECT title, download_count
FROM scores
ORDER BY download_count DESC
LIMIT 10;
```

---

### 2. 데이터 정리

```sql
-- 오래된 다운로드 기록 삭제 (1년 이상)
DELETE FROM score_downloads
WHERE downloaded_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- 비활성 팀원 조회
SELECT name, affiliation, updated_at
FROM members
WHERE is_active = false;
```

---

## 참고 문서

- [MySQL 공식 문서](https://dev.mysql.com/doc/)
- [Prisma MySQL 가이드](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
