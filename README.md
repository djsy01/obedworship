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

> **관리자로 접속하려면**: 백엔드 인증이 아직 구현 전이라(`client/src/composables/useAuth.ts`), `/login` 페이지에서 아래 Mock 계정으로 로그인하면 관리자 권한(`isAdmin`)이 부여됩니다.
>
> - `admin@obed.com` / `admin123` → admin
> - `operator@obed.com` / `operator123` → operator (admin과 동일 권한)
>
> 로그인 후 Vision/Home 등 각 페이지에 "관리자 모드 ON" 같은 버튼이 나타나면서 편집 기능이 열립니다.

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

| 항목 | 기술 |
| --- | --- |
| [Front-End](./client/README.md) | Vue 3 + TypeScript + Vite |
| Back-End | Express (`server/`, 승훈 개발 — 실제 프로덕션 백엔드) |
| [Database](./docs/ORACLE_DEPLOYMENT.md) | MySQL (Oracle Cloud 자체 호스팅) |
| Storage | DB `files` 테이블 (2026-08-13부터, 디스크/GCS에서 전환) |
| [Plans](./docs/plans.md) | 월별 개발 계획 |

### ⚠️ 백엔드 관련 참고사항

- **`server/`(Express)가 실제 프로덕션 백엔드입니다** (승훈 개발, `mysql2`/`bcrypt`/`jsonwebtoken`/GCS 사용). `test-server/`(NestJS)는 인호가 API 명세 검증용으로 만든 별도 구현체이며 배포 대상이 아닙니다.
- DB는 기존 Railway MySQL에서 Oracle Cloud 인스턴스의 자체 호스팅 MySQL로 이전했습니다. 데이터(멤버/집회기록 등)와 업로드 파일 실물 모두 이관 완료했습니다. `server/`도 같은 DB(`obedworship`)에 연결하면 됩니다 — 자세한 내용은 [docs/ORACLE_DEPLOYMENT.md](./docs/ORACLE_DEPLOYMENT.md) 참고.
- `test-server/`에서는 업로드 파일을 디스크/GCS 대신 DB `files` 테이블에 바이너리로 저장하는 방식으로 전환하는 작업을 했습니다(코드까지 완료). 다만 이건 `test-server`(NestJS) 기준 작업이라 `server/`(Express)에는 아직 반영되지 않았습니다 — `server/`에 이 방식을 적용할지는 별도 논의가 필요합니다.
- `test-server/`, `server/.env`는 `.gitignore`에 등록돼 있어 이 저장소에는 커밋되지 않습니다.
- `test-server`의 ORM은 Prisma, `server/`는 `mysql2` raw query를 사용합니다.

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

```bash
cd server
npm install
node app.js
```

> `server/.env`에 DB 접속 정보(`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`)를 오라클 DB 기준으로 맞춰야 합니다. `.env`는 git에 커밋되지 않습니다.

#### (참고) test-server — 인호 개인 테스트용, 배포 대상 아님

```bash
cd test-server
npm install
npx prisma generate
npm run start:dev
```

> `test-server/`는 git에 커밋되지 않는 폴더입니다(`.gitignore`). 로컬에 없다면 인호에게 요청하세요.

### Database

- Oracle Cloud 인스턴스에 자체 호스팅한 MySQL 사용
- `server/`는 `DB_HOST`/`DB_USER`/`DB_PASS`/`DB_NAME`/`DB_PORT`, `test-server`는 `DATABASE_URL` 환경변수로 접속
- 로컬 개발 시 SSH 터널링 필요: [docs/ORACLE_DEPLOYMENT.md](./docs/ORACLE_DEPLOYMENT.md) 참고

---

## 📊 데이터베이스 구조

### MySQL 테이블 (18개)

- **집회** (5개): worship_logs, worship_songs, worship_videos, worship_photos, worship_scores
- **집회 신청** (2개): tickets, ticket_applications
- **악보** (2개): scores, score_downloads
- **멤버** (5개): members, member_teams, member_roles, member_worship_positions, member_step_positions
- **Q&A** (1개): qna
- **사용자** (1개): users
- **자산** (1개): assets
- **파일** (1개): files — 업로드 파일 바이너리 저장 (2026-08-13 추가, [docs/ORACLE_DEPLOYMENT.md](./docs/ORACLE_DEPLOYMENT.md) 참고)

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

- [x] MySQL 테이블 설계 (18개 테이블)
- [x] 테이블 관계 정의 (CASCADE 설정)
- [x] 인덱스 최적화
- [x] Oracle Cloud 자체 호스팅 MySQL 환경 구축 (Railway에서 이전)
- [x] 업로드 파일 DB 저장 구조 설계 및 실물 파일 마이그레이션

### 🚧 백엔드 진행 중 (승훈 담당)

- [x] `server/`(Express) 라우터 구현 (auth, members, assets, worship 등 전체 도메인)
- [x] JWT 기반 인증 라우터 작성 (`server/routes/auth.js`)
- [ ] 프론트엔드 API 연동 확인
- [ ] Oracle DB(`obedworship`) 연결 설정 (`server/.env` 갱신 필요)

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
