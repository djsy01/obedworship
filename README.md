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

| 이름   | 역할          | GitHub                            | 비고           |
| ------ | ------------- | --------------------------------- | -------------- |
| 김승훈 | Back-End      | [Siya](https://github.com/SIya45) | API 개발       |
| 엄인호 | Front-End, DB | [Inho](https://github.com/djsy01) | UI/UX, DB 설계 |

---

## 🧩 핵심 기능

### 📄 페이지

- **Home** - 메인 페이지 (히어로 섹션, 주요 기능 소개)
- **Vision** - 비전 소개 및 팀원 필터링 (All/Leader/Worship/Step)
- **집회 안내** - 집회 목록 및 상세 정보 (안내/갤러리/악보 탭)
- **악보** - 자작곡/편곡 악보 검색 및 다운로드
- **집회 신청** - 티켓팅 시스템 연동
- **오시는 길** - 구글맵 임베드 및 길찾기
- **Q&A** - 질문 게시판 (관리자 답변 기능)

### 🔐 인증 시스템

- 로그인 / 회원가입 (이메일 인증)
- 아이디 찾기 / 비밀번호 재설정
- 관리자 / 일반 사용자 권한 분리

### ⚙️ 관리자 기능

- 집회 추가/수정/삭제
- 영상/사진/악보 업로드 및 관리
- 악보 추가/수정/삭제
- Q&A 답변 작성 및 수정

### 🎨 UI/UX

- 모바일 반응형 디자인 (900px/768px/480px 브레이크포인트)
- 햄버거 메뉴 (모바일)
- 오디오 플레이어 (헤더 통합)
- 라이트박스 (사진 갤러리)
- PDF 미리보기 모달

---

## 🛠️ 기술 스택

> 자세한 내용은 문서를 눌러 각 항목의 세부사항을 확인할 수 있습니다

| 항목                               | 기술                      |
| ---------------------------------- | ------------------------- |
| [Front-End](./client/README.md)    | Vue 3 + TypeScript + Vite |
| [Back-End](./server/README.md)     | Node.js + Express         |
| [Database](./database/database.md) | Redis + MySQL             |
| [Plans](./docs/plans.md)           | 월별 개발 계획            |

---

## 📂 디렉토리 구조

```
WorshipLog/
├── client/         # 프론트엔드 (Vue 3 + TypeScript)
│   ├── src/
│   │   ├── assets/      # 이미지, 음악, 아이콘
│   │   ├── components/  # 재사용 컴포넌트
│   │   ├── composables/ # Composition API
│   │   ├── layouts/     # 레이아웃
│   │   ├── router/      # Vue Router
│   │   ├── styles/      # CSS 파일
│   │   └── views/       # 페이지 컴포넌트
│   └── README.md
│
├── server/         # 백엔드 (Node.js + Express)
│   └── README.md
│
├── database/       # 데이터베이스 스키마
│   ├── database.md  # DB 전체 설명
│   ├── MySQL.md     # MySQL 테이블 상세
│   └── Redis.md     # Redis 구조
│
├── docs/           # 개발 계획 및 문서
│   ├── plans.md
│   ├── 25.11_plan.md
│   └── 25.12_plan.md
│
└── README.md       # 프로젝트 메인 문서
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
npm run dev
```

### Database

- MySQL: `database/MySQL.md` 참조하여 테이블 생성
- Redis: 설치 및 실행

---

## 📊 데이터베이스 구조

### MySQL 테이블 (13개)

- **집회** (5개): worship_logs, worship_songs, worship_videos, worship_photos, worship_scores
- **악보** (2개): scores, score_downloads
- **멤버** (5개): members, member_teams, member_roles, member_worship_positions, member_step_positions
- **Q&A** (1개): qna

### Redis

- 사용자 인증 및 세션 관리
- userId 기반으로 MySQL과 연동

자세한 내용은 [database/database.md](./database/database.md) 참조

---

## 🎯 개발 현황

### ✅ 완료

- [x] 모든 페이지 UI/UX 구현
- [x] 모바일 반응형 디자인
- [x] 관리자 기능 UI
- [x] MySQL 테이블 설계 및 관계 정의
- [x] 필터링 및 검색 기능
- [x] 페이지네이션
- [x] 라이트박스 및 모달
- [x] 티켓팅 시스템 통합
- [x] 마이페이지 개발

### 🚧 진행 중

- [ ] 백엔드 API 개발
- [ ] 파일 업로드 기능 구현
- [ ] Redis 인증 시스템 연동

### 📝 예정

- [ ] 실제 데이터베이스 연동
- [ ] 프로덕션 배포

---

## 📱 화면 미리보기

_(추후 스크린샷 추가 예정)_

---

## 🔒 라이선스

Copyright [2025] [djsy01]

All Rights Reserved.

본 저작물의 복제, 수정, 배포 또는 어떠한 형태의 사용도 저작권자의 명시적인 사전 허가 없이는 엄격히 금지됩니다.

---

## 📞 문의

- GitHub Issues: 이슈 등록을 통한 문의
- Email: (추가 예정)

---

## 🎵 OBED Worship 소개

**"순종과 경외로 주님과 소통하는 예배 공동체"**

빠르게 변화하는 세상 속에서 주님을 향해 두려움 없이 목소리로 소통하며,  
청중과 함께 예배의 중심을 주님께 드리는 찬양팀입니다.

- 📍 장소: 예수인교회 본관 지하 2층
- 📸 Instagram: [@obed_worship](https://www.instagram.com/obed_worship)
- 🎥 YouTube: [@obed_worship](https://www.youtube.com/@obed_worship)
