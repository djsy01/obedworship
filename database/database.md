# 📘 – OBED Worship Homepage Database

> OBED Worship 홈페이지 DB 설명문입니다.

---

## 사용 데이터베이스

> DB 상세 설명은 이름을 눌러주세요.

| DB 이름             | DB 버전 | 비고                                |
| ------------------- | ------- | ----------------------------------- |
| Redis               | 8.2.1   | 사용자 정보 관리                    |
| [MySQL](./MySQL.md) | 9.4     | 집회, 사진, 집회신청, QaA 정보 관리 |

---

## 현재 완료 사항

### MySQL (17개 테이블)

- ✅ 집회 안내 (5개): worship_logs, worship_songs, worship_videos, worship_photos, worship_scores
- ✅ 집회 신청 (2개): tickets, ticket_applications
- ✅ 악보 관련 (2개): scores, score_downloads
- ✅ 멤버 관련 (5개): members, member_teams, member_roles, member_worship_positions, member_step_positions
- ✅ 기타 (3개): qna, users, assets

### 사용자 역할 (users_role enum)

```text
admin     - 관리자 (관리자 권한)
operator  - 운영자 (관리자 권한)
member    - 멤버 (일반 권한)
user      - 사용자 (일반 권한)
```

### 집회 신청 시스템

- **tickets 테이블**: 신청 가능한 집회 (OPEN, CLOSED, CANCELED)
- **ticket_applications 테이블**: 신청 내역
  - 상태: PENDING, CONFIRMED, CANCELLED
  - 결제: UNPAID, PAID, FREE
- worship_logs와 선택적 연결 (id, title, date, poster_url 참조)

---

## 관계 설명

### Redis → MySQL

```text
Redis의 user:user_001
        ↓
MySQL의 worship_logs.created_by = "user_001"
```

- Redis에 있는 `userId`를 MySQL의 `created_by`에 문자열로 저장
- FK 제약조건은 없음 (Redis와 MySQL 분리)

### MySQL 내부

```text
worship_logs (1개 집회)
  ├─ worship_songs (여러 곡)        [ON DELETE CASCADE]
  ├─ worship_videos (여러 영상)     [ON DELETE CASCADE]
  └─ worship_photos (여러 사진)     [ON DELETE CASCADE]
```

- 집회 삭제하면 관련된 곡, 영상, 사진도 자동 삭제

---

## 데이터 흐름

### 1️⃣ 회원가입

```text
1. 사용자가 회원가입 폼 작성
   ↓
2. 백엔드에서 Redis에 저장
   SET user:user_003 '{...}'
   SET email:newuser@obed.com "user_003"
```

### 2️⃣ 로그인

```text
1. 이메일/비밀번호 입력
   ↓
2. Redis에서 확인
   GET email:admin@obed.com → "user_001"
   GET user:user_001 → 비밀번호 검증
   ↓
3. 세션 생성
   SETEX session:abc123 1800 '{...}'
   ↓
4. 쿠키에 sessionId 저장
```

### 3️⃣ 집회 추가 (관리자)

```text
1. 관리자 로그인 확인 (Redis session 체크)
   ↓
2. MySQL에 집회 정보 저장
   INSERT INTO worship_logs (..., created_by='user_001')
   ↓
3. 곡 목록 저장
   INSERT INTO worship_songs (worship_id=1, ...)
```

### 4️⃣ 집회 조회

```text
1. 프론트엔드에서 요청
   GET /api/worship/1
   ↓
2. MySQL 조회
   SELECT * FROM worship_logs WHERE id=1
   SELECT * FROM worship_songs WHERE worship_id=1
   SELECT * FROM worship_videos WHERE worship_id=1
   ↓
3. 데이터 조합해서 응답
```

---
