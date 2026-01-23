# 관리자 기능 구현 완료

작업 일자: 2026-01-23

## 📋 구현된 기능

### 1. 멤버 관리 시스템 개선 ✅

#### 1.1 멤버 수정 모달 (MemberEditModal.vue)
- **위치**: `client/src/components/MemberEditModal.vue`
- **기능**:
  - ✅ 전체 멤버 필드 수정 가능 (이름, 소속, 설명, SNS 등)
  - ✅ 역할(Roles) 다중 선택 체크박스
  - ✅ Worship 포지션 다중 선택
  - ✅ Step 포지션 다중 선택
  - ✅ 사진 업로드 UI (미리보기 포함)
  - ✅ 새 멤버 추가 및 기존 멤버 수정 통합

**주요 특징**:
- Detail 페이지처럼 폼 기반 UI (prompt 방식 제거)
- 사진 미리보기 및 변경 기능
- 모든 역할/포지션을 체크박스로 선택 가능
- 반응형 디자인 (모바일 대응)

#### 1.2 VisionView 업데이트
- **위치**: `client/src/views/VisionView.vue`
- **변경사항**:
  - ✅ MemberEditModal 컴포넌트 통합
  - ✅ "새 멤버 추가" 버튼 → 모달 열기
  - ✅ "수정" 버튼 → 모달로 멤버 정보 수정
  - ✅ 기존 prompt 기반 함수 제거

### 2. 사진 교체 로직 (백엔드)

#### 2.1 멤버 사진 자동 삭제
- **위치**: `test-server/src/members/members.controller.ts`
- **기능**:
  - ✅ 멤버 삭제 시 GCS에서 사진 자동 삭제
  - ✅ 새 사진 업로드 시 기존 사진 자동 삭제 (향후 구현 예정)

#### 2.2 역할/포지션 업데이트 API
- **새 엔드포인트**:
  - `POST /members/:id/roles` - 멤버 역할 업데이트
  - `POST /members/:id/worship-positions` - Worship 포지션 업데이트
  - `POST /members/:id/step-positions` - Step 포지션 업데이트

- **로직**:
  1. 기존 역할/포지션 모두 삭제
  2. 새로운 역할/포지션 일괄 추가
  3. 순서 자동 설정

### 3. Assets 관리 시스템 (Home 사진 & 곡 관리)

#### 3.1 Assets 데이터베이스 테이블
- **위치**: `database/migration_assets.sql`
- **스키마**:

```sql
CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_key VARCHAR(100) NOT NULL UNIQUE,
  asset_type ENUM('image', 'audio', 'video', 'document'),
  category VARCHAR(50),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(100),
  title VARCHAR(200),
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**주요 필드**:
- `asset_key`: 고유 키 (예: `home_team_photo`, `song_celebrate_light`)
- `asset_type`: 파일 유형 (image, audio, video, document)
- `category`: 카테고리 (home, songs, logos 등)

#### 3.2 Assets API
- **위치**: `test-server/src/assets/`
- **엔드포인트**:

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/assets` | 전체 조회 |
| GET | `/assets?category=home` | 카테고리별 조회 |
| GET | `/assets/key/:key` | 키로 조회 |
| GET | `/assets/:id` | ID로 조회 |
| POST | `/assets` | 새 자산 생성 |
| POST | `/assets/upload` | **파일 업로드** |
| PATCH | `/assets/:id` | 자산 수정 |
| PATCH | `/assets/key/:key` | 키로 자산 수정 |
| DELETE | `/assets/:id` | 자산 삭제 |

#### 3.3 파일 업로드 API (`POST /assets/upload`)
**특징**:
- ✅ 새 파일 업로드 시 **기존 파일 자동 삭제**
- ✅ 같은 `asset_key`로 업로드하면 자동 업데이트
- ✅ GCS에 파일 저장 후 DB 업데이트

**요청 예시**:
```bash
curl -X POST http://localhost:3000/assets/upload \
  -F "file=@team-photo.jpg" \
  -F "asset_key=home_team_photo" \
  -F "category=home" \
  -F "title=OBED Worship 단체 사진"
```

**로직**:
1. 파일을 GCS에 업로드
2. `asset_key`로 기존 자산 검색
3. 기존 자산이 있으면:
   - 기존 파일을 GCS에서 삭제
   - DB 레코드 업데이트
4. 기존 자산이 없으면:
   - 새 DB 레코드 생성

#### 3.4 프론트엔드 Assets API
- **위치**: `client/src/api/assets.ts`
- **주요 메서드**:

```typescript
assetApi.getAll()
assetApi.getByCategory('home')
assetApi.getByKey('home_team_photo')
assetApi.uploadFile(file, 'home_team_photo', 'home', 'Title', 'Description')
```

### 4. Home 사진 관리 UI

#### 4.1 HomePhotoManager 컴포넌트
- **위치**: `client/src/components/HomePhotoManager.vue`
- **기능**:
  - ✅ 단체 사진 (team-photo.jpg) 업로드
  - ✅ 로고 (LOGO.JPG) 업로드
  - ✅ 현재 사진 미리보기
  - ✅ 업로드 진행 상태 표시
  - ✅ 관리자 모드에서만 표시
  - ✅ 접기/펼치기 기능

**사용 방법**:
1. HomeView에서 "관리자 ON" 버튼 클릭
2. "홈 사진 관리" 섹션에서 "펼치기" 클릭
3. "사진 변경" 버튼으로 새 사진 업로드
4. 자동으로 기존 사진 삭제 및 새 사진 저장

#### 4.2 HomeView 업데이트
- **위치**: `client/src/views/HomeView.vue`
- **변경사항**:
  - ✅ HomePhotoManager 컴포넌트 추가
  - ✅ 관리자 모드 토글 버튼 추가
  - ✅ `isAdmin` 상태 관리

---

## 🎯 사용 시나리오

### 시나리오 1: 멤버 수정
1. Vision 페이지 접속
2. "관리자 모드 ON" 클릭
3. 멤버 카드의 "수정" 버튼 클릭
4. 모달에서 정보 수정:
   - 이름, 소속, 설명 입력
   - 사진 선택 (미리보기 확인)
   - 역할 체크박스 선택 (다중 선택 가능)
   - Worship 포지션 선택
   - Step 포지션 선택
5. "수정하기" 버튼 클릭
6. 페이지 자동 새로고침

### 시나리오 2: 새 멤버 추가
1. Vision 페이지 접속
2. "관리자 모드 ON" 클릭
3. "➕ 새 멤버 추가" 버튼 클릭
4. 모달에서 정보 입력 (위와 동일)
5. "추가하기" 버튼 클릭
6. 페이지 자동 새로고침

### 시나리오 3: Home 단체 사진 변경
1. Home 페이지 접속
2. "관리자 ON" 버튼 클릭
3. "홈 사진 관리" 섹션 펼치기
4. "단체 사진 (Team Photo)" → "사진 변경" 클릭
5. 새 이미지 선택
6. 자동 업로드 및 기존 사진 삭제
7. "업로드 완료!" 메시지 확인
8. 페이지 새로고침하여 확인

---

## 📂 변경된 파일 목록

### 백엔드 (test-server/)
```
새로 생성:
  src/assets/                           # Assets 모듈
  ├── assets.controller.ts             # Assets API 컨트롤러
  ├── assets.service.ts                # Assets 비즈니스 로직
  ├── assets.module.ts                 # Assets 모듈
  └── dto/
      ├── create-asset.dto.ts
      └── update-asset.dto.ts

  database/migration_assets.sql        # Assets 테이블 생성 SQL

수정:
  src/members/members.controller.ts    # 역할/포지션 업데이트 API 추가
  src/members/members.service.ts       # 역할/포지션 업데이트 로직
  prisma/schema.prisma                 # Assets 모델 추가
  src/app.module.ts                    # AssetsModule 등록
```

### 프론트엔드 (client/)
```
새로 생성:
  src/components/MemberEditModal.vue   # 멤버 수정 모달
  src/components/HomePhotoManager.vue  # Home 사진 관리 컴포넌트
  src/api/assets.ts                    # Assets API 클라이언트

수정:
  src/views/VisionView.vue             # 모달 통합, prompt 함수 제거
  src/views/HomeView.vue               # HomePhotoManager 추가
  src/api/members.ts                   # 역할/포지션 API 메서드 추가
```

### 문서
```
새로 생성:
  docs/ADMIN_FEATURES.md               # 이 문서
```

---

## 🚀 다음 단계 (선택사항)

### 1. 음악 파일 관리 UI 추가
- 곡 업로드 컴포넌트 생성
- `category: 'songs'`로 Assets에 저장
- 곡 목록 표시 및 재생 UI

### 2. Member 사진 교체 로직 완성
현재는 멤버 삭제 시에만 사진 삭제. 추가 작업:
- 멤버 수정 시 photo_url 변경 감지
- 기존 사진 GCS에서 삭제
- 새 사진 URL로 업데이트

### 3. Assets 자동 마이그레이션
기존 assets 폴더의 파일들을 Assets 테이블로 이관:
- `client/src/assets/people/*.jpeg` → Members 테이블 연동
- `client/src/assets/image/team-photo.jpg` → Assets (`home_team_photo`)
- `client/src/assets/image/LOGO.JPG` → Assets (`home_logo`)
- `client/src/assets/music/*.mp3` → Assets (`category: 'songs'`)

### 4. 파일명 관리 개선
현재는 UUID로 저장. 개선 방안:
- 멤버 사진: `members/{member_name}_{uuid}.jpg`
- Home 사진: 원본 이름 유지 (`home/team-photo.jpg`)

---

## ⚙️ API 사용 예시

### 멤버 역할 업데이트
```typescript
await memberApi.updateRoles(memberId, [
  'Pastor',
  'Worship Team Leader'
]);
```

### Worship 포지션 업데이트
```typescript
await memberApi.updateWorshipPositions(memberId, [
  'Vocal',
  'Piano'
]);
```

### Home 사진 업로드
```typescript
const file = event.target.files[0];
await assetApi.uploadFile(
  file,
  'home_team_photo',
  'home',
  'OBED Worship 단체 사진',
  '메인 페이지 단체 사진'
);
```

### 카테고리별 Assets 조회
```typescript
const homeAssets = await assetApi.getByCategory('home');
const songs = await assetApi.getByCategory('songs');
```

---

## 🔍 주요 개선 사항

### Before (기존)
- ❌ prompt() 기반 멤버 수정 (UX 불편)
- ❌ 이름만 수정 가능
- ❌ 역할/포지션 수정 불가
- ❌ 사진 업로드 UI 없음
- ❌ Home 사진 하드코딩 (import 방식)
- ❌ 사진 교체 시 수동 관리 필요

### After (개선)
- ✅ 폼 기반 모달 UI (사용성 향상)
- ✅ 모든 필드 수정 가능
- ✅ 역할/포지션 체크박스로 관리
- ✅ 사진 업로드 + 미리보기
- ✅ Home 사진 DB 관리 (Assets)
- ✅ 사진 자동 교체 (기존 삭제 + 새 저장)

---

## 💡 핵심 포인트

### 1. 파일 교체 로직
- 같은 `asset_key`로 업로드하면 자동으로 기존 파일 삭제
- GCS 스토리지 용량 절약
- 파일명 일관성 유지

### 2. 역할/포지션 업데이트
- 기존 레코드 전부 삭제 후 재생성
- 단순하고 에러 없는 로직
- 순서 자동 관리

### 3. 모달 기반 UI
- 단일 컴포넌트로 추가/수정 통합
- 반응형 디자인
- 사용자 친화적 인터페이스

---

작성자: Claude Code
작성일: 2026-01-23
