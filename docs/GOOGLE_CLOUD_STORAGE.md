# Google Cloud Storage 설정 가이드

이 문서는 OBED Worship 프로젝트에서 사진 파일을 Google Cloud Storage에 업로드하기 위한 설정 가이드입니다.

## 📋 목차

1. [GCS 프로젝트 생성](#1-gcs-프로젝트-생성)
2. [버킷 생성](#2-버킷-생성)
3. [서비스 계정 생성](#3-서비스-계정-생성)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [테스트](#5-테스트)

---

## 1. GCS 프로젝트 생성

### 1.1 Google Cloud Console 접속
1. https://console.cloud.google.com/ 접속
2. 구글 계정으로 로그인

### 1.2 새 프로젝트 생성
1. 상단 프로젝트 선택 메뉴 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름 입력 (예: `obed-worship`)
4. "만들기" 클릭

### 1.3 Cloud Storage API 활성화
1. 좌측 메뉴 > "API 및 서비스" > "라이브러리"
2. "Cloud Storage API" 검색
3. "사용 설정" 클릭

---

## 2. 버킷 생성

### 2.1 버킷 만들기
1. 좌측 메뉴 > "Cloud Storage" > "버킷"
2. "만들기" 클릭
3. 버킷 이름 입력 (예: `obed-worship-files`)
   - **중요**: 버킷 이름은 전역적으로 고유해야 합니다
4. 위치 유형 선택: **Region**
5. 위치 선택: **asia-northeast3 (서울)**
6. 스토리지 클래스: **Standard**
7. 액세스 제어: **세밀함 (객체 수준 및 버킷 수준 권한)**
8. 보호 도구: 기본값 유지
9. "만들기" 클릭

### 2.2 버킷 공개 액세스 허용 (선택사항)
업로드된 파일을 공개적으로 접근 가능하게 하려면:

1. 생성한 버킷 클릭
2. "권한" 탭 클릭
3. "주 구성원 추가" 클릭
4. 새 주 구성원: `allUsers`
5. 역할: "Cloud Storage" > "Storage 객체 뷰어"
6. "저장" 클릭

---

## 3. 서비스 계정 생성

### 3.1 서비스 계정 만들기
1. 좌측 메뉴 > "IAM 및 관리자" > "서비스 계정"
2. "서비스 계정 만들기" 클릭
3. 서비스 계정 이름 입력 (예: `obed-storage-uploader`)
4. 서비스 계정 설명 입력 (예: `파일 업로드 서비스`)
5. "만들고 계속하기" 클릭

### 3.2 역할 부여
1. "역할 선택" 드롭다운 클릭
2. "Cloud Storage" > "Storage 관리자" 선택
3. "계속" 클릭
4. "완료" 클릭

### 3.3 키 생성
1. 생성된 서비스 계정 클릭
2. "키" 탭 클릭
3. "키 추가" > "새 키 만들기" 클릭
4. 키 유형: **JSON** 선택
5. "만들기" 클릭
6. JSON 키 파일이 자동으로 다운로드됩니다

### 3.4 키 파일 저장
1. 다운로드한 JSON 파일을 안전한 위치로 이동
2. 파일명 변경 (예: `gcs-service-account.json`)
3. **절대 Git에 커밋하지 마세요!**

**권장 위치**: 백엔드 환경에서 안전한 경로에 보관

---

## 4. 환경 변수 설정

### 4.1 .env 파일 수정

백엔드 `.env` 파일에 다음 내용을 추가/수정합니다:

```bash
# Google Cloud Storage
GCS_PROJECT_ID="obed-worship"
GCS_BUCKET_NAME="obed-worship-files"
GCS_KEY_FILE="/path/to/gcs-service-account.json"
```

### 4.2 .gitignore 확인

`.gitignore` 파일에 다음 내용이 포함되어 있는지 확인:

```
# Google Cloud Storage
*.json
!package.json
!package-lock.json
!tsconfig.json
```

---

## 5. 테스트

### 5.1 서버 시작

```bash
npm run start:dev
```

### 5.2 파일 업로드 테스트

#### Postman 또는 cURL로 테스트

**멤버 사진 업로드**:
```bash
curl -X POST http://localhost:3000/members/upload-photo \
  -H "Content-Type: multipart/form-data" \
  -F "photo=@/path/to/your/image.jpg"
```

**집회 사진 업로드**:
```bash
curl -X POST http://localhost:3000/worship-photos/upload \
  -H "Content-Type: multipart/form-data" \
  -F "photo=@/path/to/your/image.jpg"
```

**다중 사진 업로드**:
```bash
curl -X POST http://localhost:3000/worship-photos/upload-multiple \
  -H "Content-Type: multipart/form-data" \
  -F "photos=@/path/to/image1.jpg" \
  -F "photos=@/path/to/image2.jpg"
```

### 5.3 응답 확인

성공 시 응답:
```json
{
  "photo_url": "https://storage.googleapis.com/obed-worship-files/members/xxx-xxx-xxx.jpg"
}
```

---

## 📊 비용 정보

### 무료 할당량 (매월)
- **Storage**: 5 GB
- **Class A Operations** (업로드): 5,000회
- **Class B Operations** (다운로드): 50,000회
- **Network Egress**: 1 GB (아시아 제외)

### 예상 사용량
- 멤버 사진 20장 (각 2MB): 40 MB
- 집회 사진 100장 (각 3MB): 300 MB
- **총**: ~340 MB (무료 할당량 내)

### 참고 링크
- [GCS 가격 정책](https://cloud.google.com/storage/pricing)
- [무료 등급](https://cloud.google.com/free/docs/gcp-free-tier)

---

## 🔧 트러블슈팅

### 1. "Google Cloud Storage is not configured" 에러
- `.env` 파일의 환경 변수 확인
- 서버 재시작

### 2. "Service account key file not found" 에러
- `GCS_KEY_FILE` 경로 확인

### 3. "Permission denied" 에러
- 서비스 계정에 "Storage 관리자" 역할이 부여되었는지 확인
- 버킷 권한 확인

### 4. 업로드는 되지만 URL 접근 안 됨
- 버킷 공개 액세스 설정 확인
- `makePublic()` 호출 확인

---

## 📝 다음 단계

1. ✅ GCS 설정 완료
2. 📤 프론트엔드에서 사진 업로드 UI 구현
3. 🗄️ 기존 assets 폴더의 파일들을 GCS로 이관
4. 🔒 (선택) 서명된 URL을 사용한 비공개 파일 관리

---

## 🔐 보안 주의사항

1. **서비스 계정 키 파일**을 절대 Git에 커밋하지 마세요
2. **환경 변수**를 코드에 하드코딩하지 마세요
3. 프로덕션 환경에서는 **IAM 역할**을 최소 권한으로 설정하세요
4. 정기적으로 **사용하지 않는 키**를 삭제하세요

---

생성일: 2026-01-23
작성자: Claude Code
