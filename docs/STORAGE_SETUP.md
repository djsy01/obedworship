# Storage Setup Guide

작업 일자: 2026-01-23

## 개요

파일 업로드 시스템이 두 가지 모드로 작동하도록 개선되었습니다:
1. **Google Cloud Storage (GCS)** - 프로덕션 환경
2. **로컬 파일 저장소** - 개발 환경

## 현재 상태

현재는 **로컬 저장소 모드**로 실행됩니다. `.env` 파일에 GCS 설정이 없기 때문입니다.

### 로컬 저장소 모드

- 파일 저장 위치: `test-server/uploads/`
- URL 형식: `http://localhost:3000/uploads/{folder}/{filename}`
- 장점: 설정 없이 바로 테스트 가능
- 단점: 서버를 재시작하면 파일이 유지되지만, 배포 시 문제 발생 가능

## 파일 구조

```
test-server/
├── uploads/                    # 로컬 저장소 (gitignore에 추가됨)
│   ├── members/               # 멤버 사진
│   ├── assets/
│   │   ├── home/              # 홈 사진 (team-photo, logo)
│   │   └── songs/             # 곡 파일
│   ├── worship-photos/
│   └── scores/
```

## 사용 방법

### 개발 환경 (현재 설정)

1. 서버 실행:
```bash
cd test-server
npm run start:dev
```

2. Admin 페이지에서 파일 업로드:
   - URL: http://localhost:5173/admin
   - 로그인 필요 (관리자 권한)
   - 사진 업로드: 단체 사진, 로고
   - 곡 업로드: MP3, WAV 등

3. 업로드된 파일 확인:
   - 서버: `test-server/uploads/` 폴더
   - 브라우저: `http://localhost:3000/uploads/{folder}/{filename}`

### 프로덕션 환경 (GCS 설정 필요)

`.env` 파일에 다음 설정 추가:

```env
# Google Cloud Storage
GCS_PROJECT_ID="your-gcp-project-id"
GCS_BUCKET_NAME="your-bucket-name"
GCS_KEY_FILE="./path/to/service-account-key.json"
```

#### GCS 설정 단계

1. **Google Cloud Console에서 프로젝트 생성**
   - https://console.cloud.google.com/

2. **Storage 버킷 생성**
   - Navigation Menu → Cloud Storage → Buckets
   - "CREATE BUCKET" 클릭
   - 버킷 이름 입력 (예: `obedworship-assets`)
   - 위치 선택 (예: `asia-northeast3` - 서울)
   - "CREATE" 클릭

3. **서비스 계정 생성**
   - Navigation Menu → IAM & Admin → Service Accounts
   - "CREATE SERVICE ACCOUNT" 클릭
   - 이름 입력 (예: `obedworship-storage`)
   - Role: "Storage Object Admin" 선택
   - "CREATE KEY" → JSON 다운로드
   - 다운로드한 JSON 파일을 `test-server/gcs-key.json`에 저장

4. **.env 파일 업데이트**
```env
GCS_PROJECT_ID="your-project-id-here"
GCS_BUCKET_NAME="obedworship-assets"
GCS_KEY_FILE="./gcs-key.json"
```

5. **서버 재시작**
```bash
npm run start:dev
```

이제 파일이 GCS에 업로드되고 공개 URL이 생성됩니다:
- 형식: `https://storage.googleapis.com/{bucket}/{folder}/{filename}`

## 주요 변경 사항

### 백엔드

#### `storage.service.ts`
- **이전**: GCS만 지원, 설정 없으면 에러 발생
- **이후**: 로컬 저장소 fallback 추가
  - `useLocal` 플래그로 모드 구분
  - 로컬 모드: `uploads/` 폴더에 파일 저장
  - GCS 모드: Google Cloud Storage에 업로드

#### `assets.module.ts`
- StorageModule import 추가 (의존성 주입 문제 해결)

### 프론트엔드

#### `AssetManager.vue` (새로 생성)
- 홈 사진 관리 (단체 사진, 로고)
- 곡 관리 (업로드, 삭제)
- 실시간 미리보기

#### `AdminView.vue`
- AssetManager 컴포넌트 추가
- 관리자 대시보드에서 자산 관리 가능

#### `HomeView.vue`
- 관리자 버튼 제거
- HomePhotoManager 컴포넌트 제거
- 깔끔한 사용자 인터페이스

#### `VisionView.vue`
- "새 멤버 추가" 버튼 CSS 개선
- 배경색: `#2d5016` (어두운 녹색) → `#4caf50` (밝은 녹색)
- ➕ 이모지 가시성 향상

## API 엔드포인트

### Assets API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/assets` | 전체 자산 조회 |
| GET | `/assets?category=home` | 카테고리별 조회 |
| GET | `/assets/key/:key` | 키로 자산 조회 |
| POST | `/assets/upload` | 파일 업로드 |
| DELETE | `/assets/:id` | 자산 삭제 |

### 업로드 예시

```bash
curl -X POST http://localhost:3000/assets/upload \
  -F "file=@team-photo.jpg" \
  -F "asset_key=home_team_photo" \
  -F "category=home" \
  -F "title=OBED Worship 단체 사진"
```

## 파일 교체 로직

같은 `asset_key`로 업로드하면 자동으로 기존 파일이 삭제됩니다:

1. 새 파일 업로드 요청
2. `asset_key`로 기존 자산 검색
3. **기존 파일이 있으면**:
   - 기존 파일 삭제 (GCS 또는 로컬)
   - DB 레코드 업데이트
4. **기존 파일이 없으면**:
   - 새 DB 레코드 생성

## 보안 고려사항

### 로컬 저장소 모드
- ⚠️ 개발 전용, 프로덕션에서 사용 금지
- 파일 접근 제어 없음
- 서버 재시작 시 파일 유지 (but Railway 등 컨테이너 환경에서는 휘발성)

### GCS 모드
- ✅ 프로덕션 권장
- 파일 영구 저장
- CDN 지원 (빠른 로딩)
- 백업 및 버전 관리 가능
- 서비스 계정 키 보안 필수 (`.gitignore`에 추가)

## .gitignore 업데이트

다음 항목이 `.gitignore`에 추가되어야 합니다:

```gitignore
# Local uploads
test-server/uploads/

# GCS credentials
test-server/gcs-key.json
test-server/*.json
!test-server/package.json
!test-server/tsconfig.json
```

## 문제 해결

### 파일 업로드가 안 될 때

1. **서버 로그 확인**
```bash
cd test-server
npm run start:dev
```

로그에 다음 메시지가 표시되어야 함:
```
📁 Static files path: /Users/.../obedworship/test-server/uploads
GCS not configured. Using local file storage for development.
```

2. **uploads 폴더 권한 확인**
```bash
ls -la test-server/uploads
```

3. **브라우저 콘솔 에러 확인**
- F12 → Console 탭

### GCS 업로드 에러

- 서비스 계정 키 경로 확인
- 버킷 이름 확인
- 서비스 계정에 "Storage Object Admin" 권한 확인

## 향후 개선 사항

1. **파일 크기 제한**
   - 현재: 제한 없음
   - 개선: Multer 설정으로 제한 추가

2. **파일 타입 검증**
   - 현재: mimetype으로만 검증
   - 개선: 파일 확장자 화이트리스트 추가

3. **썸네일 생성**
   - 이미지 업로드 시 자동 리사이징

4. **CDN 연동**
   - GCS + Cloud CDN 또는 Cloudflare

---

작성자: Claude Code
작성일: 2026-01-23
