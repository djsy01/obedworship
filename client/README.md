# 📘 – OBED Worship Homepage Front-End
> OBED Worship 홈페이지 Front-End 설명문입니다.

---

## 사용 라이브러리
| 라이브러리 이름 | 라이브러리 버전 |
| ----------- | ----------- |
| vitejs/plugin-vue | 6.0.2 |
| vite-plugin-vue-devtools | 8.0.5 |
| vite | 7.2.2 |
| vue-router | 4.6.3 |
| vue | 3.5.24 |

---

## 현재 완료 사항
- Vision 페이지
- Map 페이지
- login 페이지
- register 페이지
- findid 페이지
- resetpassword 페이지
- WorshipLog 페이지 (집회 목록)
- WorshipDetail 페이지 (집회 상세)
- **관리자 전용 기능** (편집/삭제 버튼)

---

## 🔐 관리자 기능 테스트 방법

### 1. 관리자 계정으로 로그인
```
이메일: admin@obed.com
비밀번호: admin123
```

### 2. 일반 사용자 계정
```
이메일: user@obed.com
비밀번호: user123
```

### 3. 관리자만 보이는 기능
- **집회 목록 페이지**: 각 카드에 ✏️ 편집, 🗑️ 삭제 버튼
- **집회 상세 페이지**: 
  - 우측 상단 `✏️ 편집 모드` 버튼
  - 편집 모드 ON 시:
    - 영상 섹션: `+ 영상 추가` 버튼, 각 영상에 🗑️ 삭제 버튼
    - 사진 섹션: `+ 사진 추가` 버튼, 각 사진에 ✕ 삭제 버튼

---

## 실행 필수 라이브러리
```bash
npm install
npm install vue-router@4
```

---

## 실행 방법
**실행 필수 라이브러리 다운 후 실행하세요**
```bash
npm run dev
```

---

## 📁 파일 위치
- **인증**: `src/composables/useAuth.ts`
- **로그인**: `src/components/Login.vue`
- **집회 목록**: `src/views/WorshipLogView.vue`
- **집회 상세**: `src/views/WorshipDetailView.vue`