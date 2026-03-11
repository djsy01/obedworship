# 📘 OBED Worship Homepage - Client

> OBED Worship 홈페이지 프론트엔드 (Vue 3 + TypeScript + Vite)

---

## 기술 스택

| 라이브러리/프레임워크    | 버전   | 용도              |
| ------------------------ | ------ | ----------------- |
| Vue.js                   | 3.5.22 | UI 프레임워크     |
| Vue Router               | 4.6.3  | 클라이언트 라우팅 |
| TypeScript               | 5.x    | 타입 안전성       |
| Vite                     | 7.1.11 | 빌드 도구         |
| Axios                    | ^1.x   | HTTP 클라이언트   |
| @vitejs/plugin-vue       | 6.0.1  | Vue SFC 지원      |
| vite-plugin-vue-devtools | 8.0.3  | 개발 도구         |

---

## 현재 완료 사항

### 📄 페이지

- **Home** - 메인 페이지 (히어로 섹션, 기능 소개 카드)
- **Vision** - 비전 및 팀원 소개 (필터링 기능: All/Leader/Worship/Step)
- **Map** - 오시는 길 (구글맵 임베드, 길찾기 링크)
- **WorshipLog** - 집회 목록 (연도별 필터, 관리자 추가 기능)
- **WorshipDetail** - 집회 상세 (탭: 안내/갤러리/악보, 날짜 기반 악보 탭 표시)
- **Scores** - 악보 페이지 (검색, Key/BPM 필터, 페이지네이션)
- **집회 신청** - 집회 신청 시스템 (개발 중)
- **마이페이지** - 사용자 대시보드, 신청 내역 관리
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

## 🔐 테스트 계정 (Mock)

### 4개 역할 체계

- `admin`, `operator` = 관리자 권한
- `member`, `user` = 일반 권한

### 1. 관리자 계정

```text
이메일: admin@obed.com
비밀번호: admin123
```

### 2. 운영자 계정 (관리자와 동일 권한)

```text
이메일: operator@obed.com
비밀번호: operator123
```

### 3. 멤버 계정

```text
이메일: member@obed.com
비밀번호: member123
```

### 4. 일반 사용자 계정

```text
이메일: (아무 이메일)
비밀번호: (아무 비밀번호)
```

### 5. 관리자 전용 기능

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

```text
client/
├── public/                    # 정적 파일
│   └── favicon.ico
├── src/
│   ├── api/                  # API 클라이언트
│   │   ├── axios.ts         # Axios 인스턴스 설정
│   │   ├── members.ts       # 팀원 API
│   │   ├── worship.ts       # 집회 API
│   │   ├── worship-songs.ts # 집회 곡 API
│   │   ├── worship-videos.ts # 집회 영상 API
│   │   ├── worship-photos.ts # 집회 사진 API
│   │   ├── worship-scores.ts # 집회 악보 API
│   │   └── scores.ts        # 악보 라이브러리 API
│   ├── assets/              # 리소스 파일
│   │   ├── icons/          # 아이콘 (favicon, SNS)
│   │   ├── image/          # 이미지 (로고, 팀원 사진)
│   │   └── music/          # 배경음악
│   ├── components/          # 재사용 컴포넌트
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── FindId.vue
│   │   └── ResetPassword.vue
│   ├── composables/         # Composition API
│   │   └── useAuth.ts      # 인증 상태 관리
│   ├── layouts/             # 레이아웃
│   │   └── MainLayout.vue  # 메인 레이아웃 (헤더, 네비, 푸터)
│   ├── router/              # 라우터 설정
│   │   └── index.ts
│   ├── styles/              # 스타일시트
│   │   ├── main.css        # 전역 스타일
│   │   ├── Home.css
│   │   ├── Vision.css
│   │   ├── Map.css
│   │   ├── WorshipLog.css
│   │   ├── WorshipDetail.css
│   │   ├── Scores.css
│   │   ├── Qna.css
│   │   ├── Login.css
│   │   └── Register.css
│   ├── views/               # 페이지 컴포넌트
│   │   ├── HomeView.vue
│   │   ├── VisionView.vue
│   │   ├── MapView.vue
│   │   ├── WorshipLogView.vue
│   │   ├── WorshipDetailView.vue
│   │   ├── ScoresView.vue
│   │   ├── TicketsView.vue
│   │   ├── MyPageView.vue
│   │   ├── QnaView.vue
│   │   └── AdminView.vue
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
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
- **포스터**: 업로드/변경/삭제, 클릭 시 전체화면 모달
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

## ✅ 완료된 기능

### API 연동 (예정)

- [x] Axios 인스턴스 설정
- [x] API 클라이언트 모듈화
  - 팀원 API (members)
  - 집회 API (worship, worship-songs, worship-videos, worship-photos, worship-scores)
  - 악보 API (scores)
- [x] 파일 업로드 기능
  - 이미지 업로드 (포스터, 사진)
  - PDF 업로드 (악보)
  - 한글 파일명 지원
  - 원본 파일명 유지
- [x] 파일 다운로드 기능
  - 악보 PDF 다운로드
  - 로그인 필수 체크

### 집회 포스터 시스템

- [x] 포스터 업로드/변경/삭제
- [x] 안내 탭: 클릭 시 전체화면 모달
- [x] 악보 탭: 포스터 미리보기 (집회 포스터 공유)

---

## ✅ 최근 완료된 기능 (01/26)

- [x] 마이페이지 개발 (MyPageView.vue)
- [x] 4개 역할 체계 구현 (admin/operator/member/user)
- [x] 탭 가시성 로직 개선
  - 영상/사진 탭: 관리자는 항상 보임, 일반 사용자는 날짜 지난 후 + 콘텐츠 있을 때만
  - 악보 탭: 관리자는 항상 보임, 일반 사용자는 날짜 지난 후 + 악보 있을 때만

---

## 🔜 향후 작업 예정

### 필수 작업

- [ ] JWT 인증 구현
- [ ] 집회 신청 시스템 완성

### 추가 기능

- [ ] 알림 기능
- [ ] 다크 모드
- [ ] PWA 지원
- [ ] 국제화 (i18n)

### 성능 최적화

- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] 코드 스플리팅
- [ ] 캐싱 전략
- [ ] SEO 최적화

---

## 📡 백엔드 개발자를 위한 API 명세

> ⚠️ **승훈에게**: 이 섹션은 프론트엔드가 필요로 하는 API 엔드포인트 목록입니다.
> 각 API 파일(`client/src/api/*.ts`)에 더 자세한 주석이 있으니 참고하세요.

### Axios 설정 (프론트엔드)

- **Base URL**: 환경변수 `VITE_API_BASE_URL`
- **Timeout**: 10초
- **요청 인터셉터**: Authorization 헤더에 JWT 토큰 자동 추가
- **응답 인터셉터**: 401 에러 시 자동 로그아웃

### 인증 API (`/auth`)

> 현재 Mock 인증 사용 중. 실제 구현 필요.

```text
POST /auth/login          - 로그인 (email, password)
POST /auth/register       - 회원가입 (email, password, name, phone?)
POST /auth/logout         - 로그아웃
GET  /auth/session        - 세션 확인 (JWT 토큰 검증)
POST /auth/change-password - 비밀번호 변경
```

**역할 시스템 (4개)**:

- `admin`, `operator` = 관리자 권한
- `member`, `user` = 일반 권한

### API 엔드포인트

#### 팀원 (Members)

- `GET /members` - 전체 팀원 조회
- `GET /members/:id` - 특정 팀원 조회
- `POST /members` - 팀원 추가
- `PATCH /members/:id` - 팀원 수정
- `DELETE /members/:id` - 팀원 삭제

#### 집회 (Worship)

- `GET /worship` - 전체 집회 조회
- `GET /worship/:id` - 특정 집회 조회
- `GET /worship/year/:year` - 연도별 집회 조회
- `POST /worship` - 집회 생성
- `PATCH /worship/:id` - 집회 수정
- `DELETE /worship/:id` - 집회 삭제

#### 집회 곡 (Worship Songs)

- `POST /worship-songs` - 집회 곡 추가
- `DELETE /worship-songs/:id` - 집회 곡 삭제

#### 집회 영상 (Worship Videos)

- `POST /worship-videos` - 영상 추가
- `DELETE /worship-videos/:id` - 영상 삭제

#### 집회 사진 (Worship Photos)

- `POST /worship-photos` - 사진 추가
- `POST /worship-photos/upload` - 사진 파일 업로드
- `DELETE /worship-photos/:id` - 사진 삭제

#### 집회 악보 (Worship Scores)

- `POST /worship-scores` - 악보 추가
- `POST /worship-scores/upload` - 악보 파일 업로드
- `DELETE /worship-scores/:id` - 악보 삭제

#### 악보 라이브러리 (Scores)

- `GET /scores` - 전체 악보 조회
- `GET /scores/:id` - 특정 악보 조회
- `POST /scores` - 악보 추가
- `POST /scores/upload` - 악보 파일 업로드
- `PATCH /scores/:id` - 악보 수정
- `DELETE /scores/:id` - 악보 삭제

#### 파일 업로드 (Photos)

- `POST /photos/upload` - 이미지 파일 업로드 (포스터, 사진)

---

## 🔧 환경 변수

### `.env` 파일

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Railway 배포 시

```env
VITE_API_BASE_URL=https://your-api-url.railway.app
```

---

## 📚 참고 문서

- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Axios Documentation](https://axios-http.com/)
- [DATABASE.md](../docs/DATABASE.md) - 데이터베이스 스키마
- [MYSQL.md](../docs/MYSQL.md) - MySQL 설정 가이드
- [REDIS.md](../docs/REDIS.md) - Redis 구현 계획

---

## 📞 문의

프로젝트 관련 문의사항은 이슈 트래커를 이용해주세요.
