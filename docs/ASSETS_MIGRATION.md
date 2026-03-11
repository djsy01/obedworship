# Assets 파일 이관 가이드

이 문서는 `client/src/assets` 폴더의 파일들을 Google Cloud Storage로 이관하는 가이드입니다.

## 📋 현재 Assets 현황

### 이미지 파일 (People)
```
client/src/assets/people/
├── DrumWook.jpeg
├── Giin.jpeg
├── Jongeon.jpeg
├── inho.JPG
├── jungsuk.jpeg
├── mijung.jpeg
├── onnew.jpeg
└── yesol.jpeg
```
**총 8개 파일**

### 이미지 파일 (Image)
```
client/src/assets/image/
├── LOGO.JPG
├── Logo.png
└── team-photo.jpg
```
**총 3개 파일**

### 음악 파일 (Music)
```
client/src/assets/music/
├── CelebratetheLight(inst).mp3
└── 빛의사자들이여(inst).mp3
```
**총 2개 파일**

### 아이콘 파일
```
client/src/assets/icons/
├── favicon.ico
├── Instargram.png
├── soundcloud.png
└── Youtube.png
```
**총 4개 파일**

---

## 🎯 이관 전략

### 1단계: 멤버 사진 이관 (우선순위: 높음)
- **대상**: `assets/people/*.{jpeg,JPG}`
- **이관 방법**: GCS 업로드 후 DB 업데이트
- **영향**: Vision 페이지

### 2단계: 로고 및 팀 사진 (우선순위: 중간)
- **대상**: `assets/image/LOGO.JPG`, `team-photo.jpg`
- **이관 방법**: GCS 업로드 후 하드코딩 URL 변경
- **영향**: 여러 페이지

### 3단계: 음악 파일 (우선순위: 낮음)
- **대상**: `assets/music/*.mp3`
- **이관 방법**: GCS 업로드
- **참고**: 음악 파일은 크기가 크므로 Cloud Storage CDN 활용 권장

### 4단계: 아이콘 (우선순위: 낮음)
- **대상**: `assets/icons/*`
- **이관 방법**: 유지 또는 GCS 업로드
- **참고**: 작은 아이콘은 로컬 유지 권장

---

## 📤 이관 절차

### 1단계: 멤버 사진 업로드

#### 1.1 백엔드 API 사용

**자동화 스크립트** (예정):

```typescript
import { memberApi } from '../src/api/members';
import * as fs from 'fs';
import * as path from 'path';

const ASSETS_PATH = '../../client/src/assets/people';

const memberPhotos = [
  { name: '엄인호', filename: 'inho.JPG' },
  { name: '이기인 장로', filename: 'Giin.jpeg' },
  { name: '김미정', filename: 'mijung.jpeg' },
  { name: '박상욱', filename: 'DrumWook.jpeg' },
  { name: '김온유', filename: 'onnew.jpeg' },
  { name: '오종언', filename: 'Jongeon.jpeg' },
  { name: '신예솔', filename: 'yesol.jpeg' },
  { name: '김정석', filename: 'jungsuk.jpeg' },
];

async function uploadMemberPhotos() {
  for (const member of memberPhotos) {
    try {
      const filePath = path.join(__dirname, ASSETS_PATH, member.filename);
      const fileBuffer = fs.readFileSync(filePath);
      const file = new File([fileBuffer], member.filename);

      console.log(`Uploading ${member.name}의 사진...`);
      const response = await memberApi.uploadPhoto(file);

      console.log(`✅ ${member.name}: ${response.data.photo_url}`);

      // TODO: DB 업데이트 - member의 photo_url 필드 업데이트
      // await memberApi.update(memberId, { photo_url: response.data.photo_url });
    } catch (error) {
      console.error(`❌ ${member.name} 업로드 실패:`, error);
    }
  }
}

uploadMemberPhotos();
```

#### 1.2 수동 업로드 (Postman 사용)

1. Postman에서 새 요청 생성
2. Method: `POST`
3. URL: `http://localhost:3000/members/upload-photo`
4. Body 탭 > `form-data` 선택
5. Key: `photo`, Type: `File`, Value: 파일 선택
6. Send 클릭
7. 응답에서 `photo_url` 복사

#### 1.3 DB 업데이트

각 멤버의 `photo_url` 필드를 업데이트:

```sql
UPDATE members
SET photo_url = 'https://storage.googleapis.com/obed-worship-files/members/xxx-xxx.jpeg'
WHERE name = '엄인호';
```

또는 API 사용:
```typescript
await memberApi.update(memberId, {
  photo_url: 'https://storage.googleapis.com/...'
});
```

---

### 2단계: 로고 및 팀 사진 업로드

#### 2.1 GCS에 업로드

수동 업로드:
1. GCS Console > 버킷 선택
2. "업로드" 클릭
3. 파일 선택 (`LOGO.JPG`, `team-photo.jpg`)
4. 업로드 완료 후 공개 URL 복사

#### 2.2 코드에서 URL 변경

**VisionView.vue**:
```typescript
// Before
import logo from "@/assets/image/LOGO.JPG";

// After
const logo = "https://storage.googleapis.com/obed-worship-files/images/LOGO.JPG";
```

**HomeView.vue**:
```typescript
// Before
import teamPhoto from "@/assets/image/team-photo.jpg";

// After
const teamPhoto = "https://storage.googleapis.com/obed-worship-files/images/team-photo.jpg";
```

---

### 3단계: 음악 파일 업로드

음악 파일은 크기가 크므로 직접 GCS Console에서 업로드 권장:

1. GCS Console > 버킷 선택
2. 폴더 생성: `music`
3. "업로드" 클릭
4. 파일 선택
5. 공개 URL 복사 후 코드에서 사용

---

### 4단계: 아이콘 처리

아이콘은 작고 자주 사용되므로 **로컬 유지 권장**.
- favicon.ico: `public/` 폴더에 유지
- SNS 아이콘: `assets/icons/`에 유지

---

## 🗂️ 폴더 구조 변경

### Before (현재)
```
client/src/assets/
├── people/
│   ├── DrumWook.jpeg
│   ├── Giin.jpeg
│   └── ...
├── image/
│   ├── LOGO.JPG
│   └── team-photo.jpg
├── music/
│   ├── CelebratetheLight(inst).mp3
│   └── 빛의사자들이여(inst).mp3
└── icons/
    ├── Instargram.png
    └── Youtube.png
```

### After (이관 후)
```
client/src/assets/
└── icons/
    ├── Instargram.png
    └── Youtube.png

GCS Bucket (obed-worship-files):
├── members/
│   ├── uuid-1.jpeg (DrumWook)
│   ├── uuid-2.jpeg (Giin)
│   └── ...
├── images/
│   ├── LOGO.JPG
│   └── team-photo.jpg
└── music/
    ├── CelebratetheLight(inst).mp3
    └── 빛의사자들이여(inst).mp3
```

---

## ✅ 체크리스트

### 이관 전
- [ ] GCS 프로젝트 생성 완료
- [ ] 버킷 생성 완료
- [ ] 서비스 계정 키 설정 완료
- [ ] `.env` 파일 설정 완료
- [ ] 백엔드 서버 정상 작동 확인

### 멤버 사진 이관
- [ ] 8개 멤버 사진 GCS 업로드
- [ ] DB `members.photo_url` 필드 업데이트
- [ ] Vision 페이지에서 GCS URL 로드 확인
- [ ] 기존 `assets/people` 폴더 백업

### 로고 및 팀 사진 이관
- [ ] LOGO.JPG GCS 업로드
- [ ] team-photo.jpg GCS 업로드
- [ ] 코드에서 import 문 제거 및 URL로 변경
- [ ] 모든 페이지에서 정상 로드 확인

### 음악 파일 이관
- [ ] 음악 파일 2개 GCS 업로드
- [ ] 음악 재생 기능 정상 작동 확인

### 이관 후
- [ ] 모든 페이지에서 이미지 정상 로드 확인
- [ ] 네트워크 탭에서 GCS URL 확인
- [ ] `assets/people` 폴더 삭제 (백업 후)
- [ ] `assets/image` 폴더 정리
- [ ] `assets/music` 폴더 삭제 (백업 후)

---

## 🔄 롤백 계획

이관 중 문제 발생 시:

1. **즉시 롤백**: Git에서 이전 버전으로 되돌리기
   ```bash
   git checkout -- client/src/
   ```

2. **부분 롤백**: 특정 파일만 복원
   ```bash
   git checkout -- client/src/views/VisionView.vue
   ```

3. **백업 활용**: 이관 전 assets 폴더 백업본 사용
   ```bash
   cp -r backup/assets client/src/
   ```

---

## 📊 예상 작업 시간

| 작업 | 예상 시간 |
|------|----------|
| 1단계: 멤버 사진 이관 | 30분 |
| 2단계: 로고/팀 사진 이관 | 15분 |
| 3단계: 음악 파일 이관 | 10분 |
| 4단계: 테스트 및 검증 | 30분 |
| **총** | **1시간 25분** |

---

## 🚀 자동화 스크립트 (고급)

전체 이관을 자동화하려면:

```bash
# migrate-assets.sh (예정)

#!/bin/bash

echo "Assets 이관 시작..."

# 1. 멤버 사진 업로드
echo "1. 멤버 사진 업로드 중..."
node scripts/upload-member-photos.js

# 2. 로고 업로드
echo "2. 로고 업로드 중..."
gsutil cp ../../client/src/assets/image/LOGO.JPG gs://obed-worship-files/images/
gsutil acl ch -u AllUsers:R gs://obed-worship-files/images/LOGO.JPG

# 3. 팀 사진 업로드
echo "3. 팀 사진 업로드 중..."
gsutil cp ../../client/src/assets/image/team-photo.jpg gs://obed-worship-files/images/
gsutil acl ch -u AllUsers:R gs://obed-worship-files/images/team-photo.jpg

# 4. 음악 파일 업로드
echo "4. 음악 파일 업로드 중..."
gsutil cp ../../client/src/assets/music/*.mp3 gs://obed-worship-files/music/
gsutil acl ch -u AllUsers:R gs://obed-worship-files/music/*

echo "✅ 이관 완료!"
```

---

생성일: 2026-01-23
작성자: Claude Code
