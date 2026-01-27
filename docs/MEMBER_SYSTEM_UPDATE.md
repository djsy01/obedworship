# Member System Update

작업 일자: 2026-01-23

## 개요

멤버 시스템을 데이터베이스 기반으로 전환하고 users 테이블과 연동하도록 개선했습니다.

## 주요 변경 사항

### 1. Users 테이블 추가

새로운 `users` 테이블을 생성하여 사용자 인증 시스템의 기반을 마련했습니다.

#### 테이블 구조
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'member', 'user') NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    profile_photo_url VARCHAR(500),
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 역할(Role) 설명
- `admin`: 관리자 - 모든 기능 접근 가능
- `member`: 멤버 - OBED 팀원, 자신의 정보 수정 가능
- `user`: 일반 사용자 - 열람만 가능

### 2. Members 테이블 업데이트

`members` 테이블에 `user_id` 컬럼을 추가하여 users 테이블과 연결했습니다.

```sql
ALTER TABLE members
ADD COLUMN user_id INT NULL,
ADD CONSTRAINT fk_members_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
```

#### 관계 설명
- **1:1 관계**: 한 명의 user는 하나의 member 프로필을 가질 수 있습니다
- **Optional**: `user_id`는 nullable - 모든 member가 user 계정을 가질 필요는 없습니다
- **ON DELETE SET NULL**: user 삭제 시 member는 유지되고 user_id만 NULL로 설정
- **ON UPDATE CASCADE**: user id 변경 시 자동으로 member의 user_id도 업데이트

### 3. Member 데이터 시드

17명의 OBED 팀원 정보를 데이터베이스에 저장했습니다.

#### 포함된 정보
- 이름, 소속(affiliation)
- 사진 URL
- SNS 링크 (Instagram, YouTube)
- 설명(description)
- 표시 순서(display_order)

#### 제외된 정보
Positions(역할, 포지션)은 별도의 테이블에서 관리됩니다:
- `member_roles`: 리더십 역할 (Pastor, Elder, Team Leader 등)
- `member_worship_positions`: 찬양 포지션 (Vocal, Guitar, Drum 등)
- `member_step_positions`: Step 포지션 (Media Team, Stage Team 등)

### 4. Prisma Schema 업데이트

#### Users 모델 추가
```prisma
model users {
  id                Int       @id @default(autoincrement())
  email             String    @unique @db.VarChar(255)
  password_hash     String    @db.VarChar(255)
  name              String    @db.VarChar(100)
  role              users_role @default(user)
  is_active         Boolean?  @default(true)
  email_verified    Boolean?  @default(false)
  phone             String?   @db.VarChar(20)
  profile_photo_url String?   @db.VarChar(500)
  last_login_at     DateTime? @db.Timestamp(0)
  created_at        DateTime? @default(now()) @db.Timestamp(0)
  updated_at        DateTime? @default(now()) @db.Timestamp(0)
  members           members[]

  @@index([email], map: "idx_email")
  @@index([role], map: "idx_role")
  @@index([is_active], map: "idx_is_active")
}

enum users_role {
  admin
  member
  user
}
```

#### Members 모델 업데이트
```prisma
model members {
  id                       Int                        @id @default(autoincrement())
  user_id                  Int?
  name                     String                     @db.VarChar(100)
  affiliation              members_affiliation
  // ... other fields ...
  users                    users?                     @relation(fields: [user_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  member_roles             member_roles[]
  member_step_positions    member_step_positions[]
  member_teams             member_teams[]
  member_worship_positions member_worship_positions[]

  @@index([user_id], map: "idx_user_id")
}
```

### 5. VisionView 업데이트

더미 데이터를 제거하고 API에서 멤버 정보를 불러오도록 변경했습니다.

#### 주요 변경 사항

**이전**: 하드코딩된 멤버 배열
```typescript
const members = ref<Member[]>([
  { id: 1, name: "박훈 목사", ... },
  { id: 2, name: "이기인 장로", ... },
  // ... 하드코딩된 17명의 데이터
]);
```

**이후**: API에서 동적으로 로드
```typescript
const members = ref<Member[]>([]);
const loading = ref(true);

const loadMembers = async () => {
  try {
    loading.value = true;
    const response = await memberApi.getAll();

    members.value = response.data.map((apiMember) => ({
      id: apiMember.id,
      name: apiMember.name,
      affiliation: apiMember.affiliation,
      photo_url: apiMember.photo_url || logo,
      instagram_url: apiMember.instagram_url || null,
      youtube_url: apiMember.youtube_url || null,
      roles: apiMember.member_roles?.map((r) => r.role_type) || [],
      worship_positions: apiMember.member_worship_positions?.map((p) => p.position_type) || [],
      step_positions: apiMember.member_step_positions?.map((p) => p.position_type) || [],
      description: apiMember.description || "",
    }));
  } catch (error) {
    console.error("Failed to load members:", error);
    alert("멤버 정보를 불러오는데 실패했습니다.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadMembers();
});
```

#### 개선 효과
- ✅ 데이터 일관성: DB가 단일 진실 공급원(single source of truth)
- ✅ 실시간 업데이트: 멤버 추가/수정/삭제 시 즉시 반영
- ✅ 유지보수 편의: 코드 수정 없이 DB에서 데이터 관리
- ✅ 로딩 상태: 사용자에게 로딩 피드백 제공

## 마이그레이션 실행 방법

### 1. SQL 실행

```bash
# MySQL 접속
mysql -u your_username -p your_database_name

# 마이그레이션 파일 실행
source /Users/inho/Desktop/Cording/obedworship/database/migration_users_and_seed_members.sql
```

또는 MySQL Workbench, DBeaver 등의 GUI 도구를 사용하여 SQL 파일을 실행하세요.

### 2. Prisma Client 재생성

```bash
cd backend
npx prisma generate
```

### 3. 서버 재시작

```bash
npm run start:dev
```

### 4. 사진 URL 업데이트

마이그레이션에서 사용한 플레이스홀더 URL을 실제 사진 URL로 업데이트하세요:

```sql
-- 예시: 엄인호의 사진 URL 업데이트
UPDATE members
SET photo_url = 'http://localhost:3000/uploads/members/inho.jpg'
WHERE id = 4;
```

또는 Admin 페이지에서 각 멤버의 사진을 업로드하면 자동으로 URL이 업데이트됩니다.

## 데이터 구조

### Member 데이터 흐름

```
Database (members table)
    ↓ (MembersService.findAll())
API Response with relations
    {
      id: 1,
      name: "박훈 목사",
      affiliation: "목사",
      member_roles: [{ role_type: "Pastor" }],
      member_worship_positions: [],
      member_step_positions: []
    }
    ↓ (VisionView transformation)
Frontend Member Object
    {
      id: 1,
      name: "박훈 목사",
      affiliation: "목사",
      roles: ["Pastor"],
      worship_positions: [],
      step_positions: []
    }
```

## Users와 Members 연결하기

멤버에게 user 계정을 연결하려면:

### 1. User 생성

```sql
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'inho@obedworship.com',
  '$2b$10$hashed_password_here',  -- bcrypt 해시 사용
  '엄인호',
  'member'
);
```

### 2. Member에 user_id 설정

```sql
-- 방금 생성한 user의 id 확인
SELECT id FROM users WHERE email = 'inho@obedworship.com';

-- member에 user_id 설정 (예: user id가 5라고 가정)
UPDATE members
SET user_id = 5
WHERE id = 4;  -- 엄인호의 member id
```

### 3. 인증 시스템에서 활용

```typescript
// 로그인 시
const user = await prisma.users.findUnique({
  where: { email },
  include: { members: true }
});

if (user.members.length > 0) {
  // 이 user는 OBED 팀원입니다
  const memberProfile = user.members[0];
  console.log(`${memberProfile.name}님 환영합니다!`);
}
```

## 향후 작업 계획

### 1. 인증 시스템 구현
- [ ] 회원가입 API
- [ ] 로그인 API (JWT 토큰 발급)
- [ ] 비밀번호 재설정
- [ ] 이메일 인증

### 2. 권한 관리
- [ ] 관리자: 모든 멤버 정보 수정
- [ ] 멤버: 자신의 정보만 수정
- [ ] 일반 사용자: 읽기 전용

### 3. 마이페이지
- [ ] 로그인한 멤버가 자신의 프로필 수정
- [ ] 프로필 사진 업로드
- [ ] SNS 링크 관리
- [ ] 포지션 신청/변경 (관리자 승인 필요)

### 4. 알림 시스템
- [ ] 새 집회 등록 시 멤버에게 이메일 알림
- [ ] 역할/포지션 변경 시 알림
- [ ] 중요 공지사항 푸시 알림

## 문제 해결

### 에러: "Cannot read properties of null"

**원인**: 데이터베이스에 member 데이터가 없음

**해결**:
1. 마이그레이션 SQL이 정상적으로 실행되었는지 확인
2. MySQL에서 직접 확인: `SELECT * FROM members;`
3. 데이터가 없다면 시드 SQL 재실행

### 에러: "Unknown column 'user_id'"

**원인**: members 테이블에 user_id 컬럼이 추가되지 않음

**해결**:
```sql
ALTER TABLE members
ADD COLUMN user_id INT NULL;
```

### 에러: Prisma Client 업데이트 필요

**원인**: schema.prisma 변경 후 Prisma Client 재생성하지 않음

**해결**:
```bash
cd backend
npx prisma generate
npm run start:dev
```

### 사진이 표시되지 않음

**원인**: photo_url이 플레이스홀더 URL이거나 잘못된 경로

**해결**:
1. Admin 페이지에서 각 멤버의 사진을 업로드
2. 또는 SQL로 직접 URL 업데이트:
```sql
UPDATE members
SET photo_url = 'http://localhost:3000/uploads/members/inho.jpg'
WHERE name = '엄인호';
```

## 파일 변경 요약

### 생성된 파일
- `/database/migration_users_and_seed_members.sql` - SQL 마이그레이션 파일
- `/docs/MEMBER_SYSTEM_UPDATE.md` - 이 문서

### 수정된 파일
- `prisma/schema.prisma` - users 모델 추가, members에 user_id 추가
- `/client/src/views/VisionView.vue` - 더미 데이터 제거, API 로드 추가

## 참고 사항

- 모든 member의 positions(roles, worship_positions, step_positions)는 별도의 조인 테이블에서 관리됩니다
- Admin 페이지의 MemberEditModal을 통해 positions를 추가/수정할 수 있습니다
- photo_url이 null이면 기본 로고가 표시됩니다
- 사진은 로컬 저장소(`uploads/members/`) 또는 GCS에 저장됩니다

---

작성자: Claude Code
작성일: 2026-01-23
