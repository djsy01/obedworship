# 📘 – OBED Worship Homepage Database
> OBED Worship 홈페이지 DB 설명문입니다.

---

## 사용 데이터베이스
> DB 상세 설명은 이름을 눌러주세요.

| DB 이름 | DB 버전 | 비고 |
| ----- | ----- | ----- |
| Redis | 8.2.1 | 사용자 정보 관리 |
| [MySQL](./MySQL.md) | 9.4 | 집회, 악보, 멤버, Q&A 정보 관리 |

---

## 현재 완료 사항

### MySQL 테이블 설계 완료
- **집회 관련 테이블** (5개)
  - `worship_logs` - 집회 기본 정보
  - `worship_songs` - 집회 곡 목록
  - `worship_videos` - 집회 영상
  - `worship_photos` - 집회 사진
  - `worship_scores` - 집회 악보 (송폼 + 전체 악보 PDF)

- **악보 관련 테이블** (2개)
  - `scores` - 자작곡 및 편곡 악보 라이브러리
  - `score_downloads` - 악보 다운로드 기록

- **멤버 관련 테이블** (5개)
  - `members` - 팀원 기본 정보
  - `member_teams` - 팀 소속 (Worship/회계/홍보/영상/무대/기도)
  - `member_roles` - 리더 역할 (Pastor/Elder/Team Leader 등)
  - `member_worship_positions` - Worship 포지션 (Vocal/Piano/Guitar/Drum 등)
  - `member_step_positions` - Step 세부 포지션 (영상편집/믹싱/조명 등)

- **Q&A 테이블** (1개)
  - `qna` - 질문 및 답변

### 데이터베이스 특징
- ✅ 정규화된 테이블 구조
- ✅ CASCADE 설정 (데이터 정합성 보장)
- ✅ 인덱스 최적화 (검색 성능 향상)
- ✅ FULLTEXT INDEX (한글 검색 지원)
- ✅ Redis 연동 준비 (userId 기반)

---

## 관계 설명

### Redis → MySQL
```
Redis의 user:user_001
        ↓
MySQL의 worship_logs.created_by = "user_001"
MySQL의 scores.uploaded_by = "user_001"
MySQL의 worship_scores.uploaded_by = "user_001"
MySQL의 score_downloads.user_id = "user_001"
MySQL의 qna.user_id = "user_001"
```
- Redis에 있는 `userId`를 MySQL의 관련 필드에 문자열로 저장
- FK 제약조건은 없음 (Redis와 MySQL 분리)
- **역할 분담**: Redis는 사용자 인증/세션 관리, MySQL은 컨텐츠 관리

### MySQL 내부 관계
```
worship_logs (1개 집회)
  ├─ worship_songs (여러 곡)          [ON DELETE CASCADE]
  ├─ worship_videos (여러 영상)       [ON DELETE CASCADE]
  ├─ worship_photos (여러 사진)       [ON DELETE CASCADE]
  └─ worship_scores (1개 PDF)         [ON DELETE CASCADE]

scores (1개 악보)
  └─ score_downloads (다운로드 기록)  [ON DELETE CASCADE]

members (1명의 팀원)
  ├─ member_teams (소속 팀들)                  [ON DELETE CASCADE]
  ├─ member_roles (리더 역할들)                [ON DELETE CASCADE]
  ├─ member_worship_positions (Worship 포지션) [ON DELETE CASCADE]
  └─ member_step_positions (Step 포지션)       [ON DELETE CASCADE]

qna (독립 테이블)
```
- 집회 삭제 → 관련 곡/영상/사진/악보 자동 삭제
- 멤버 삭제 → 관련 팀/역할/포지션 정보 자동 삭제
- 악보 삭제 → 다운로드 기록 자동 삭제

---

## 데이터 흐름 예시

### 1️⃣ 회원가입
```
1. 사용자가 회원가입 폼 작성
   ↓
2. 백엔드에서 Redis에 저장
   SET user:user_003 '{"email":"user@obed.com", ...}'
   SET email:user@obed.com "user_003"
```

### 2️⃣ 로그인
```
1. 이메일/비밀번호 입력
   ↓
2. Redis에서 확인
   GET email:admin@obed.com → "user_001"
   GET user:user_001 → 비밀번호 검증
   ↓
3. 세션 생성
   SETEX session:abc123 1800 '{"userId":"user_001", ...}'
   ↓
4. 쿠키에 sessionId 저장
```

### 3️⃣ 집회 추가 (관리자)
```
1. 관리자 로그인 확인 (Redis session 체크)
   ↓
2. MySQL에 집회 정보 저장
   INSERT INTO worship_logs (..., created_by='user_001')
   ↓
3. 곡 목록 저장
   INSERT INTO worship_songs (worship_id=1, ...)
   ↓
4. 영상/사진/악보 업로드 (선택사항)
   INSERT INTO worship_videos (worship_id=1, ...)
   INSERT INTO worship_photos (worship_id=1, ...)
   INSERT INTO worship_scores (worship_id=1, ...)
```

### 4️⃣ 집회 조회
```
1. 프론트엔드에서 요청
   GET /api/worship/1
   ↓
2. MySQL 조회
   SELECT * FROM worship_logs WHERE id=1
   SELECT * FROM worship_songs WHERE worship_id=1
   SELECT * FROM worship_videos WHERE worship_id=1
   SELECT * FROM worship_photos WHERE worship_id=1
   SELECT * FROM worship_scores WHERE worship_id=1
   ↓
3. 데이터 조합해서 JSON 응답
```

### 5️⃣ 악보 다운로드
```
1. 로그인 확인 (Redis session 체크)
   ↓
2. MySQL에 다운로드 기록 저장
   INSERT INTO score_downloads (score_id=1, user_id='user_001', ...)
   ↓
3. 다운로드 카운트 증가
   UPDATE scores SET download_count = download_count + 1 WHERE id=1
   ↓
4. 파일 URL 반환
```

### 6️⃣ Vision 페이지 팀원 조회
```
1. 프론트엔드에서 요청
   GET /api/members?filter=worship&position=vocal
   ↓
2. MySQL 조인 쿼리
   SELECT m.*, mr.role_type, mwp.position_type
   FROM members m
   LEFT JOIN member_roles mr ON m.id = mr.member_id
   LEFT JOIN member_worship_positions mwp ON m.id = mwp.member_id
   WHERE mwp.position_type = 'Vocal'
   ORDER BY mr.role_order, mwp.position_order, m.name
   ↓
3. 정렬된 팀원 목록 반환
```

---

## 주요 인덱스

### 검색 성능 최적화
- `worship_logs`: year, date
- `scores`: song_key, category, bpm, title, created_at
- `members`: affiliation, is_active, display_order
- `qna`: status, category, created_at

### FULLTEXT 검색
- `scores.title`: ngram parser (한글 검색 지원)

### UNIQUE 제약
- `member_teams`: (member_id, team_type, priority)
- `member_roles`: (member_id, role_type)
- `member_worship_positions`: (member_id, position_type)
- `member_step_positions`: (member_id, position_type)

---

## 향후 작업 계획

### 데이터베이스
- [ ] Railway 환경에서 테이블 생성 및 테스트
- [ ] 샘플 데이터 입력 (실제 집회 정보, 팀원 정보)
- [ ] 백엔드 API와 연동 테스트
- [ ] 성능 테스트 및 쿼리 최적화

### 추가 테이블 설계 예정
- [ ] 티켓팅 시스템 테이블
- [ ] 알림(notification) 테이블
- [ ] 파일 메타데이터 테이블
- [ ] 통계 및 분석 테이블

### Redis 연동
- [ ] 세션 관리 구조 확정
- [ ] 사용자 정보 스키마 확정
- [ ] Redis-MySQL 동기화 로직 설계

---

## 테이블 목록 (총 13개)

| 번호 | 테이블명 | 설명 | 관계 |
|-----|---------|------|-----|
| 1 | worship_logs | 집회 기본 정보 | 부모 |
| 2 | worship_songs | 집회 곡 목록 | worship_logs 자식 |
| 3 | worship_videos | 집회 영상 | worship_logs 자식 |
| 4 | worship_photos | 집회 사진 | worship_logs 자식 |
| 5 | worship_scores | 집회 악보 | worship_logs 자식 |
| 6 | scores | 자작곡/편곡 악보 | 부모 |
| 7 | score_downloads | 악보 다운로드 기록 | scores 자식 |
| 8 | members | 팀원 기본 정보 | 부모 |
| 9 | member_teams | 팀원 팀 소속 | members 자식 |
| 10 | member_roles | 팀원 리더 역할 | members 자식 |
| 11 | member_worship_positions | Worship 포지션 | members 자식 |
| 12 | member_step_positions | Step 포지션 | members 자식 |
| 13 | qna | Q&A | 독립 |

---

## 참고 사항
- 모든 테이블은 `utf8mb4` 인코딩 사용 (이모지 지원)
- 자동 타임스탬프 (`created_at`, `updated_at`) 설정
- InnoDB 엔진 사용 (트랜잭션 및 외래키 지원)