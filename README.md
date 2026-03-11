# 📘 – OBED Worship 웹사이트

> OBED Worship 공식 홈페이지 프로젝트

---

## ✨ 프로젝트 개요

| 항목           | 내용                                                   |
| -------------- | ------------------------------------------------------ |
| 🎯 목표        | OBED Worship 홍보 및 정보 제공 웹사이트                |
| 🧑‍🤝‍🧑 대상 사용자 | OBED Worship에 관심있는 모든 사람 (청소년, 청년, 장년) |
| 📅 개발 기간   | 2025.11 ~ 진행 중                                      |
| 🚀 배포        | 예정                                                   |

---

## 🧑‍💻 팀 구성

| 이름   | 역할               | GitHub                            | 비고               |
| ------ | ------------------ | --------------------------------- | ------------------ |
| 김승훈 | Back-End, Security | [Siya](https://github.com/SIya45) | API 개발, 보안설계 |
| 엄인호 | Front-End, DB      | [Inho](https://github.com/djsy01) | UI/UX, DB 설계     |

---

## 🧩 핵심 기능

### 📄 페이지

- **Home** - 메인 페이지 (히어로 섹션, 주요 기능 소개)
- **Vision** - 비전 소개 및 팀원 필터링 (All/Leader/Worship/Step)
- **집회 안내** - 집회 목록 및 상세 정보 (안내/갤러리/악보 탭)
- **악보** - 자작곡/편곡 악보 검색 및 다운로드
- **집회 신청** - 집회 신청 시스템 (예정)
- **마이페이지** - 사용자 대시보드 및 신청 내역 관리
- **오시는 길** - 구글맵 임베드 및 길찾기
- **Q&A** - 질문 게시판 (관리자 답변 기능)

### 🔐 인증 시스템

- 로그인 / 회원가입 (이메일 인증)
- 아이디 찾기 / 비밀번호 재설정
- 4개 역할 기반 권한 분리
  - `admin`, `operator` = 관리자 권한
  - `member`, `user` = 일반 권한

### ⚙️ 관리자 기능

- 집회 추가/수정/삭제
- 영상/사진/악보 업로드 및 관리
- 악보 추가/수정/삭제
- Q&A 답변 작성 및 수정
- 멤버 관리 (추가/수정/삭제)
- 자산 관리 (로고, 홈 이미지, 음악 등)

### 🎨 UI/UX

- 모바일 반응형 디자인 (900px/768px/480px 브레이크포인트)
- 햄버거 메뉴 (모바일)
- 오디오 플레이어 (헤더 통합)
- 라이트박스 (사진 갤러리)
- PDF 미리보기 모달

---

## 🛠️ 기술 스택

> 자세한 내용은 문서를 눌러 각 항목의 세부사항을 확인할 수 있습니다

| 항목                                      | 기술                      |
| ----------------------------------------- | ------------------------- |
| [Front-End](./client/README.md)           | Vue 3 + TypeScript + Vite |
| Back-End                                  | 담당자(승훈) 개발 예정    |
| [Test Server](./test-server/README.md)    | NestJS (테스트용)         |
| [Database](./database/database.md)        | MySQL (Railway)           |
| [Storage](./docs/GOOGLE_CLOUD_STORAGE.md) | Google Cloud Storage      |
| [Plans](./docs/plans.md)                  | 월별 개발 계획            |

### ⚠️ 백엔드 관련 참고사항

- 실제 프로덕션 백엔드는 승훈이 별도로 개발할 예정입니다
- 테스트 서버는 API 엔드포인트 예시로 참고할 수 있습니다
- ORM은 Prisma를 사용했지만, 실제 백엔드는 다른 ORM/라이브러리 사용 가능합니다

---

## 📂 디렉토리 구조

```text
obedworship/
├── client/           # 프론트엔드 (Vue 3 + TypeScript)
│   ├── src/
│   │   ├── api/          # API 클라이언트
│   │   ├── assets/       # 이미지, 음악, 아이콘
│   │   ├── components/   # 재사용 컴포넌트
│   │   ├── composables/  # Composition API
│   │   ├── layouts/      # 레이아웃
│   │   ├── router/       # Vue Router
│   │   ├── styles/       # CSS 파일
│   │   └── views/        # 페이지 컴포넌트
│   └── README.md
│
├── database/         # 데이터베이스 문서
│   ├── database.md   # DB 전체 설명
│   ├── MySQL.md      # MySQL 테이블 상세
│   └── Redis.md      # Redis 구조 (인증용)
│
├── docs/             # 개발 계획 및 문서
│   ├── plans.md
│   ├── 25.11_plan.md
│   ├── 25.12_plan.md
│   ├── 26.01_plan.md
│   └── ...
│
└── README.md         # 프로젝트 메인 문서
```

---

## 🚀 Quick Start

### Front-End

```bash
cd client
npm install
npm run dev
```

### Back-End

> 담당자 진행 예정

### Database

- Railway MySQL: 환경변수 `DATABASE_URL` 설정 필요

---

## 📊 데이터베이스 구조

### MySQL 테이블 (17개)

- **집회** (5개): worship_logs, worship_songs, worship_videos, worship_photos, worship_scores
- **집회 신청** (2개): tickets, ticket_applications
- **악보** (2개): scores, score_downloads
- **멤버** (5개): members, member_teams, member_roles, member_worship_positions, member_step_positions
- **Q&A** (1개): qna
- **사용자** (1개): users
- **자산** (1개): assets

### Redis (예정)

- 사용자 인증 및 세션 관리
- userId 기반으로 MySQL과 연동

자세한 내용은 [database/database.md](./database/database.md) 참조

---

## 🎯 개발 현황

### ✅ 프론트엔드 완료 (인호 담당)

- [x] 모든 페이지 UI/UX 구현
- [x] 모바일 반응형 디자인
- [x] 관리자 기능 UI
- [x] 필터링 및 검색 기능
- [x] 페이지네이션
- [x] 라이트박스 및 모달
- [x] 4개 역할 체계 구현 (admin/operator/member/user)
- [x] 탭 가시성 로직 (영상/사진/악보 조건부 표시)
- [x] 마이페이지 UI
- [x] 집회 신청 UI
- [x] 테스트용 Mock 인증 시스템

### ✅ 데이터베이스 완료 (인호 담당)

- [x] MySQL 테이블 설계 (17개 테이블)
- [x] 테이블 관계 정의 (CASCADE 설정)
- [x] 인덱스 최적화
- [x] Railway MySQL 환경 구축

### 🚧 백엔드 진행 예정 (승훈 담당)

- [ ] 실제 백엔드 API 개발
- [ ] JWT 인증 시스템 구현
- [ ] API 연동

### 📝 예정

- [ ] 프로덕션 배포

---

## 👥 협업 가이드

### 인호 담당 영역

- `client/` - 프론트엔드 전체 코드
- `database/` - 데이터베이스 스키마 설계
- `docs/` - 개발 문서 및 계획
- Google Cloud Storage 설정

### 승훈 담당 영역

- 실제 프로덕션 백엔드 API 개발
- 인증/보안 시스템 구현

### 공유 리소스

- `database/MySQL.md` - 테이블 스키마 (참고용)
- `client/src/api/` - 프론트엔드가 필요로 하는 API 엔드포인트 정의
- `docs/GOOGLE_CLOUD_STORAGE.md` - 파일 저장소 설정 가이드

### 백엔드 개발 시 참고사항

- ORM 선택 자유 (Prisma, TypeORM, Sequelize, 또는 raw SQL)
- `client/src/api/*.ts` 파일에 필요한 API 엔드포인트 명세 있음
- 각 API 파일 상단에 필요한 엔드포인트 목록 주석으로 정리됨

---

## 🔒 라이선스

Copyright [2025] [djsy01]

All Rights Reserved.

본 저작물의 복제, 수정, 배포 또는 어떠한 형태의 사용도 저작권자의 명시적인 사전 허가 없이는 엄격히 금지됩니다.

---

## 📞 문의

- GitHub Issues: 이슈 등록을 통한 문의
- Email: (추가 예정)
