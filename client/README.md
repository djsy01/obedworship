# 📘 – OBED Worship Homepage Front-End
> OBED Worship 홈페이지 Front-End 설명문입니다.

---

## 사용 라이브러리
| 라이브러리 이름 | 라이브러리 버전 |
| ----------- | ----------- |
| @vitejs/plugin-vue | 6.0.1 |
| vite-plugin-vue-devtools | 8.0.3 |
| vite | 7.1.11 |
| vue-router | 4.6.3 |
| vue | 3.5.22 |

---

## 현재 완료 사항

### 📄 페이지
- **Home** - 메인 페이지 (히어로 섹션, 기능 소개 카드)
- **Vision** - 비전 및 팀원 소개 (필터링 기능: All/Leader/Worship/Step)
- **Map** - 오시는 길 (구글맵 임베드, 길찾기 링크)
- **WorshipLog** - 집회 목록 (연도별 필터, 관리자 추가 기능)
- **WorshipDetail** - 집회 상세 (탭: 안내/갤러리/악보, 날짜 기반 악보 탭 표시)
- **Scores** - 악보 페이지 (검색, Key/BPM 필터, 페이지네이션)
- **Tickets** - 집회 신청
- **Q&A** - 질문 및 답변 (카테고리 필터, 관리자 답변 기능, 통계)

### 🔐 인증 관련
- **Login** - 로그인
- **Register** - 회원가입 (이메일 인증 플로우)
- **FindId** - 아이디 찾기
- **ResetPassword** - 비밀번호 재설정

### 🎨 레이아웃 및 UI/UX
- **MainLayout** - 헤더, 네비게이션, 푸터
  - 데스크톱: 로고 + 오디오 플레이어 + 네비게이션 + 로그인/드롭다운
  - 모바일: 로고 + 오디오 플레이어 + 햄버거 메뉴 (사이드 슬라이드)
- **반응형 디자인** - 모든 페이지 모바일 최적화 (900px/768px/480px 브레이크포인트)
- **오디오 플레이어** - 헤더 통합 미니 플레이어 (자동 다음곡 재생)

### ⚙️ 주요 기능
- **관리자 전용 기능** (useAuth composable 기반)
  - 집회: 추가/수정/삭제, 영상/사진/악보 관리
  - 악보: 추가/수정/삭제
  - Q&A: 답변 작성 및 수정
- **필터링 및 검색**
  - Vision 팀원: 역할별, Worship 포지션별, Step 포지션별
  - 악보: 제목 검색, Key 선택, 정렬(제목/BPM/최신순)
  - Q&A: 카테고리별 (집회/악보/기타)
- **페이지네이션** - 악보 목록 (10개씩, 버튼식 네비게이션)
- **라이트박스** - 집회 사진 갤러리 (이전/다음 버튼)
- **PDF 미리보기 모달** - 악보 클릭 시 전체화면 모달

---

## 🔐 관리자 기능 테스트 방법

### 1. 관리자 계정 (Mock)
```
이메일: admin@obed.com
비밀번호: admin123
```

### 2. 일반 사용자 계정 (Mock)
```
이메일: user@obed.com
비밀번호: user123
```

### 3. 관리자 전용 기능
- **집회 목록**: 각 카드 우측 상단 ✏️ 편집, 🗑️ 삭제
- **집회 상세**: 
  - 우측 상단 `✏️ 편집 모드` 토글 버튼
  - 편집 모드 활성화 시:
    - 영상: `+ 영상 추가`, 각 영상 우측 상단 🗑️ 삭제
    - 사진: `+ 사진 추가`, 각 사진 우측 상단 ✕ 삭제
    - 악보: `악보 업로드`, 우측 상단 🗑️ 삭제
- **악보 페이지**: 상단 `악보 추가`, 테이블 내 ✏️/🗑️
- **Q&A**: 각 질문 하단 `💬 답변 작성` / `✏️ 답변 수정`

---

## 🚀 실행 방법

### 설치
```bash
npm install
```

### 개발 서버
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 프리뷰
```bash
npm run preview
```

---

## 📁 프로젝트 구조
```
client/
├── src/
│   ├── assets/           # 이미지, 음악, 아이콘
│   │   ├── image/        # 로고, 팀원 사진
│   │   ├── music/        # 배경음악
│   │   └── icons/        # SNS 아이콘
│   ├── components/       # 재사용 컴포넌트
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── FindId.vue
│   │   └── ResetPassword.vue
│   ├── composables/      # Composition API
│   │   └── useAuth.ts    # 인증 상태 관리
│   ├── layouts/          # 레이아웃
│   │   └── MainLayout.vue
│   ├── router/           # Vue Router 설정
│   │   └── index.ts
│   ├── styles/           # CSS 파일
│   │   ├── main.css      # 전역 스타일
│   │   ├── Home.css
│   │   ├── Vision.css
│   │   ├── Map.css
│   │   ├── WorshipLog.css
│   │   ├── WorshipDetail.css
│   │   ├── Scores.css
│   │   ├── Qna.css
│   │   ├── Login.css
│   │   └── Register.css
│   ├── views/            # 페이지 컴포넌트
│   │   ├── HomeView.vue
│   │   ├── VisionView.vue
│   │   ├── MapView.vue
│   │   ├── WorshipLogView.vue
│   │   ├── WorshipDetailView.vue
│   │   ├── ScoresView.vue
│   │   ├── TicketsView.vue
│   │   └── QnaView.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎨 반응형 브레이크포인트
- **900px 이하**: 햄버거 메뉴 활성화, 데스크톱 네비게이션 숨김
- **768px 이하**: 그리드 2열 → 1열, 폰트 크기 축소
- **480px 이하**: 추가 최적화 (간격, 버튼 크기, 패딩 등)

---

## 📝 주요 기능 상세

### Vision 페이지 필터링
- **메인 필터**: All, Leader, Worship, Step
- **Worship 세부 필터**: 
  - Vocal, Piano(Piano+Synthesizer), Guitar(4종), Drum
- **Step 세부 필터**: 
  - Accounting, Planning, Media, Stage, Prayer
- **정렬 우선순위**: 역할(Role) → 포지션 → 이름(가나다순)

### 집회 상세 페이지
- **탭 구조**: 안내 / 영상·사진 / 악보
- **악보 탭 조건**: 집회 날짜 이후에만 표시 (당일 포함)
- **저작권 안내**: 제외된 곡 목록 경고 표시
- **영상/사진 갤러리**: 라이트박스 기능

### 악보 페이지
- **검색**: 곡 제목 실시간 검색
- **필터**: Key 선택, 정렬(제목/BPM/최신순)
- **페이지네이션**: 페이지당 10개 (총 N 페이지)
- **다운로드**: 로그인 필수

### Q&A
- **카테고리**: 집회, 악보, 기타
- **통계 카드**: 전체/답변완료/답변대기 건수
- **상태**: WAITING, ANSWERED
- **질문자 비공개**: 화면에 표시 안 됨

---

## ⚠️ 현재 상태 (Mock 데이터)
- **인증**: 프론트엔드 Mock (실제 API 연동 필요)
- **데이터**: 모든 페이지 하드코딩된 더미 데이터
- **파일 업로드**: UI만 구현 (실제 업로드 로직 필요)
- **다운로드**: alert로 대체 (실제 파일 다운로드 구현 필요)

---

## 🔜 향후 작업 예정
- [ ] 백엔드 API 연동 (axios 설정, API 클라이언트)
- [ ] 파일 업로드 기능 구현 (이미지, PDF)
- [ ] 실제 파일 다운로드 구현
- [ ] 마이페이지 개발
- [ ] 티켓팅 시스템 통합
- [ ] Redis 기반 인증 시스템 연동