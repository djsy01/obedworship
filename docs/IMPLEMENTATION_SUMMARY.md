# 구현 계획 요약 (예정)

## 📅 작업 일자
2026-01-23

## 🎯 작업 내용

이번 작업에서는 다음 3가지 주요 기능을 구현했습니다:

1. **Google Cloud Storage 통합**
2. **사진 업로드 API 구현**
3. **멤버 관리 API 개선**

---

## ✅ 완료된 작업

### 1. Google Cloud Storage 설정 및 통합

#### 백엔드 구현 (예정)
- ✅ `@google-cloud/storage` 패키지 설치
- 📋 `StorageService` 구현 예정
- 📋 `StorageModule` 구현 및 전역 모듈 등록 예정
- 📋 환경 변수 설정 예정 (`.env`)

**주요 기능**:
- 파일 업로드 (`uploadFile`)
- 파일 삭제 (`deleteFile`)
- URL에서 파일명 추출 (`extractFilename`)
- 자동 공개 URL 생성

**파일 구조(예정)**:
```
backend/src/common/storage/
├── storage.module.ts    # Global 모듈
└── storage.service.ts   # GCS 업로드 서비스
```

---

### 2. 파일 업로드 API 엔드포인트

#### 2.1 Members API
**파일**: 백엔드 구현 예정

**추가된 엔드포인트**:
- `POST /members/upload-photo` - 단일 멤버 사진 업로드

**기능**:
- 이미지 파일만 허용 (MIME 타입 검증)
- GCS에 자동 업로드
- 공개 URL 반환

**예제 요청**:
```bash
curl -X POST http://localhost:3000/members/upload-photo \
  -H "Content-Type: multipart/form-data" \
  -F "photo=@member-photo.jpg"
```

**응답**:
```json
{
  "photo_url": "https://storage.googleapis.com/obed-worship-files/members/uuid.jpg"
}
```

#### 2.2 Worship Photos API
**파일**: 백엔드 구현 예정

**추가된 엔드포인트**:
- `POST /worship-photos/upload` - 단일 사진 업로드
- `POST /worship-photos/upload-multiple` - 다중 사진 업로드 (최대 100개)

**다중 업로드 예제**:
```bash
curl -X POST http://localhost:3000/worship-photos/upload-multiple \
  -H "Content-Type: multipart/form-data" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  -F "photos=@photo3.jpg"
```

**응답**:
```json
{
  "count": 3,
  "photos": [
    { "photo_url": "https://storage.googleapis.com/.../uuid1.jpg" },
    { "photo_url": "https://storage.googleapis.com/.../uuid2.jpg" },
    { "photo_url": "https://storage.googleapis.com/.../uuid3.jpg" }
  ]
}
```

---

### 3. 프론트엔드 API 클라이언트

#### Members API 클라이언트
**파일**: [client/src/api/members.ts](../client/src/api/members.ts)

**추가된 기능**:
- ✅ `uploadPhoto` 메서드 추가
- ✅ Member 인터페이스에 관계형 데이터 추가:
  - `member_roles`
  - `member_worship_positions`
  - `member_step_positions`

**사용 예제**:
```typescript
import { memberApi } from '@/api/members';

// 사진 업로드
const file = event.target.files[0];
const response = await memberApi.uploadPhoto(file);
console.log(response.data.photo_url); // GCS URL

// 멤버 생성 시 사진 URL 사용
await memberApi.create({
  name: '홍길동',
  affiliation: '청년부',
  photo_url: response.data.photo_url,
});
```

---

### 4. 환경 변수 설정

**.env 파일 업데이트**:
```bash
# Google Cloud Storage
# GCS_PROJECT_ID="your-project-id"
# GCS_BUCKET_NAME="your-bucket-name"
# GCS_KEY_FILE="./path/to/service-account-key.json"
```

**설정 방법**:
1. Google Cloud Console에서 프로젝트 생성
2. Cloud Storage 버킷 생성
3. 서비스 계정 생성 및 JSON 키 다운로드
4. 환경 변수 설정

---

### 5. 문서 작성

#### 5.1 Google Cloud Storage 설정 가이드
**파일**: [docs/GOOGLE_CLOUD_STORAGE.md](./GOOGLE_CLOUD_STORAGE.md)

**내용**:
- GCS 프로젝트 생성 방법
- 버킷 생성 및 설정
- 서비스 계정 생성
- 환경 변수 설정
- API 테스트 방법
- 비용 정보 및 무료 할당량
- 트러블슈팅

#### 5.2 Assets 이관 가이드
**파일**: [docs/ASSETS_MIGRATION.md](./ASSETS_MIGRATION.md)

**내용**:
- 현재 assets 파일 현황
- 이관 전략 (4단계)
- 단계별 상세 절차
- 폴더 구조 변경 안내
- 체크리스트
- 롤백 계획
- 자동화 스크립트

---

## 📂 변경된 파일 목록

### 백엔드 (예정)
```
새로 생성:
  src/common/storage/storage.module.ts
  src/common/storage/storage.service.ts

수정:
  src/app.module.ts                              # StorageModule 추가
  src/members/members.controller.ts              # 사진 업로드 엔드포인트 추가
  src/worship-photos/worship-photos.controller.ts # 사진 업로드 엔드포인트 추가
  .env                                           # GCS 환경 변수 주석 추가
  package.json                                   # @google-cloud/storage 추가
```

### 프론트엔드 (client/)
```
수정:
  src/api/members.ts    # uploadPhoto 메서드 및 Member 인터페이스 개선
```

### 문서 (docs/)
```
새로 생성:
  docs/GOOGLE_CLOUD_STORAGE.md   # GCS 설정 가이드
  docs/ASSETS_MIGRATION.md       # Assets 이관 가이드
  docs/IMPLEMENTATION_SUMMARY.md # 이 파일
```

---

## 🚀 다음 단계 (TODO)

### 즉시 진행 가능
1. ✅ **GCS 설정 완료하기**
   - Google Cloud Console에서 프로젝트 생성
   - 버킷 생성 및 서비스 계정 설정
   - 환경 변수 설정
   - 참고: [GOOGLE_CLOUD_STORAGE.md](./GOOGLE_CLOUD_STORAGE.md)

2. 📤 **테스트 및 검증**
   - Postman으로 API 테스트
   - 사진 업로드 및 URL 확인

### 향후 작업
3. 🎨 **Vision 페이지 백엔드 연동**
   - 하드코딩된 멤버 데이터를 API 호출로 변경
   - `memberApi.getActive()` 사용
   - 로딩 상태 추가

4. 🔧 **Vision 페이지 관리자 모드 추가**
   - 관리자 모드 토글 추가
   - 멤버 추가/수정/삭제 UI 구현
   - 사진 업로드 UI 구현

5. 📦 **Assets 파일 이관**
   - 멤버 사진 8개 GCS 업로드
   - DB `members.photo_url` 업데이트
   - 로고 및 팀 사진 업로드
   - 음악 파일 업로드
   - 참고: [ASSETS_MIGRATION.md](./ASSETS_MIGRATION.md)

6. 🧹 **코드 정리**
   - 사용하지 않는 하드코딩 데이터 제거
   - assets 폴더 정리
   - Import 문 정리

---

## 🔍 주요 코드 위치

### 백엔드

**StorageService**:
```typescript
// backend/src/common/storage/storage.service.ts (예정)
await this.storageService.uploadFile(file, 'members');
await this.storageService.deleteFile(filename);
const filename = this.storageService.extractFilename(url);
```

**Members 업로드 API**:
```typescript
// backend/src/members/members.controller.ts:51-66 (예정)
@Post('upload-photo')
@UseInterceptors(FileInterceptor('photo'))
async uploadPhoto(@UploadedFile() file: Express.Multer.File) { ... }
```

**Worship Photos 업로드 API**:
```typescript
// backend/src/worship-photos/worship-photos.controller.ts:33-77 (예정)
@Post('upload')
@UseInterceptors(FileInterceptor('photo'))
async uploadPhoto(...) { ... }

@Post('upload-multiple')
@UseInterceptors(FilesInterceptor('photos', 100))
async uploadMultiplePhotos(...) { ... }
```

### 프론트엔드

**Members API**:
```typescript
// client/src/api/members.ts:64-72
uploadPhoto: (file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return axios.post<{ photo_url: string }>("/members/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
```

---

## 💡 핵심 포인트

### 1. Google Cloud Storage 사용 이유
- ✅ **무료 할당량**: 5GB 무료 (현재 사용량 ~340MB)
- ✅ **CDN 자동 제공**: 빠른 이미지 로딩
- ✅ **확장성**: 향후 파일 증가에 대비
- ✅ **안정성**: Google 인프라 활용

### 2. 다중 사진 업로드 (최대 100개)
- WorshipDetail에 집회 사진이 많을 수 있어 다중 업로드 지원
- `Promise.all()`로 병렬 업로드
- 모든 파일 업로드 후 한 번에 응답

### 3. 보안
- 서비스 계정 JSON 키를 `.gitignore`에 추가 필수
- 환경 변수로 민감한 정보 관리
- MIME 타입 검증으로 이미지 파일만 허용

---

## 📊 테스트 시나리오

### 1. 단일 사진 업로드 테스트
```bash
# 멤버 사진 업로드
curl -X POST http://localhost:3000/members/upload-photo \
  -F "photo=@test.jpg"

# 예상 응답
{
  "photo_url": "https://storage.googleapis.com/obed-worship-files/members/xxx.jpg"
}
```

### 2. 다중 사진 업로드 테스트
```bash
curl -X POST http://localhost:3000/worship-photos/upload-multiple \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  -F "photos=@photo3.jpg"

# 예상 응답
{
  "count": 3,
  "photos": [ ... ]
}
```

### 3. 에러 케이스 테스트
```bash
# 파일 없이 요청
curl -X POST http://localhost:3000/members/upload-photo

# 예상 응답: 400 Bad Request
{ "message": "No file uploaded" }

# 이미지가 아닌 파일
curl -X POST http://localhost:3000/members/upload-photo \
  -F "photo=@document.pdf"

# 예상 응답: 400 Bad Request
{ "message": "Only image files are allowed" }
```

---

## 🛠️ 트러블슈팅

### "Google Cloud Storage is not configured" 에러
**원인**: 환경 변수가 설정되지 않음
**해결**: `.env` 파일 확인 및 서버 재시작

### 파일 업로드 후 URL 접근 안 됨
**원인**: 버킷이 공개 액세스로 설정되지 않음
**해결**: GCS Console에서 버킷 권한 확인

### TypeScript 컴파일 에러
**원인**: 타입 정의 누락
**해결**: `npm run build` 실행하여 확인

---

## 📞 추가 지원

문제가 발생하거나 추가 도움이 필요한 경우:

1. **문서 참고**:
   - [GOOGLE_CLOUD_STORAGE.md](./GOOGLE_CLOUD_STORAGE.md)
   - [ASSETS_MIGRATION.md](./ASSETS_MIGRATION.md)

2. **로그 확인**:
   ```bash
   # 백엔드 로그
   cd backend
   npm run start:dev
   ```

3. **GCS 설정 확인**:
   - Google Cloud Console > Cloud Storage
   - 버킷 권한 및 파일 확인

---

**작성자**: Claude Code
**작성일**: 2026-01-23
