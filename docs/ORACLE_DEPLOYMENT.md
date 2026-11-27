# Oracle Cloud 인프라 구축 & DB 마이그레이션

작업 일자: 2026-08-13

## 📋 배경

기존에는 Railway MySQL + Google Cloud Storage(GCS) 조합을 썼으나, 오라클 클라우드(OCI) 컴퓨트 인스턴스로 MySQL과 업로드 파일을 이관했다. 초기 이관과 스키마 검증에는 `test-server/`를 사용했다. 운영 백엔드 배포 대상은 Node.js에서 실행하는 `server/app.js`다.

## 🖥️ 인스턴스 스펙 및 기본 세팅

- Shape: `VM.Standard.E2.1.Micro` (AMD 고정형, 1 OCPU / 1GB RAM, Always Free)
- OS: Ubuntu 22.04.5 LTS
- Swap 2GB 추가 (`/swapfile`, RAM 1GB + Swap 2GB = 총 3GB 가용 메모리)
- SSH 키: `ssh-key-2026-08-13.key` (`.gitignore`에 `ssh-key-*.key` 패턴으로 등록, 저장소에 커밋되지 않음)

> 참고: E2.1.Micro는 고정형(AMD) shape라 콘솔에서 바로 리사이즈가 안 된다. RAM을 실제로 늘리려면 A1.Flex(ARM) 인스턴스를 새로 만들어야 하는데, 지금은 swap으로 충분해서 그대로 사용 중.

## 📦 설치된 소프트웨어

| 소프트웨어 | 버전 | 용도 |
| --- | --- | --- |
| MySQL | 8.0.46 | 메인 DB (`obedworship`) |
| Redis | 6.0.16 | 세션/캐싱 예정 (아직 코드에서 미사용) |
| Node.js | 24.19.0 | 백엔드 런타임 |
| PM2 | 7.0.3 | 프로세스 매니저 (코드 배포 후 사용 예정) |

- MySQL/Redis 모두 `localhost`에만 바인딩 (외부 포트 미개방, 백엔드가 같은 인스턴스에서 돌기 때문에 보안상 불필요)
- MySQL DB: `obedworship`, 계정: `obedworship` (권한: `obedworship.*` ALL PRIVILEGES)

## 🗄️ DB 마이그레이션 (Railway → Oracle)

1. `test-server/prisma/schema.prisma` 기준으로 `npx prisma db push`를 실행해 Oracle MySQL에 스키마 생성 (18개 테이블, 아래 "files 테이블 추가" 참고)
2. `mysqldump`로 Railway MySQL의 데이터(INSERT문만, `--no-create-info`)를 Oracle MySQL로 직접 이관
   - `members` 18건, `worship_logs` 4건 등 정상 이관 확인
   - `users`는 원래 0건 (auth 미구현이라 실제 회원 데이터 없음)
3. `test-server/.env`의 `DATABASE_URL`을 Railway 접속 문자열에서 `mysql://obedworship:***@localhost:3306/obedworship`로 교체

### 로컬 개발 환경에서 Oracle DB 접속

Oracle MySQL은 `localhost`에만 열려있으므로, 로컬 Mac에서 개발할 때는 SSH 터널을 띄워야 한다.

```bash
ssh -i ssh-key-2026-08-13.key -L 3306:localhost:3306 ubuntu@<PUBLIC_IP> -N
```

터널을 띄운 채로 로컬 `test-server`를 실행하면 `.env`의 `localhost:3306`이 그대로 Oracle DB를 가리킨다.

## 📁 파일 저장 방식 변경: 디스크 → DB

기존에는 업로드 파일(멤버 사진, 악보 PDF, assets 이미지/오디오 등)을 `test-server/uploads/` 디스크에 저장하고 `*_url` 컬럼에 경로만 저장했다(Railway 배포 시엔 별도 볼륨 마운트 사용, `railway.json` 참고). 이번에 이 방식을 DB 저장으로 바꿨다.

### 스키마 변경

`prisma/schema.prisma`에 공통 `files` 테이블 추가:

```prisma
model files {
  id         Int      @id @default(autoincrement())
  filename   String   @db.VarChar(255)
  mime_type  String   @db.VarChar(100)
  size       Int
  data       Bytes    @db.LongBlob
  created_at DateTime @default(now()) @db.Timestamp(0)
}
```

- 기존 `photo_url` / `file_url` / `thumbnail_url` / `poster_url` 컬럼 구조는 그대로 유지
- 값만 디스크 경로(`/uploads/...`) 대신 `/files/{id}` 형태로 저장

### 실물 파일 이관

`test-server/uploads/`에 있던 실제 파일 20개를 `files` 테이블로 이관 완료 (`test-server/scripts/migrate-uploads-to-db.js`).

| 구분 | 개수 | 비고 |
| --- | --- | --- |
| 멤버 사진 | 8 | `members.photo_url` |
| 악보 PDF | 4 | `scores.file_url`, `worship_scores.file_url` |
| 자산(로고/사진/BGM) | 4 | `assets.file_url` — wav 2개 포함 (58MB, 142MB) |
| 집회 포스터 | 4 | `worship_logs.poster_url` |

142MB짜리 대용량 wav 파일까지 넣기 위해 MySQL `max_allowed_packet`을 기본 64MB → **256MB**로 상향 조정함 (`/etc/mysql/mysql.conf.d/mysqld.cnf`).

## 운영 백엔드 실행

서버의 작업 디렉터리를 `server/`로 설정한다. `npm ci`로 의존성을 설치하고 `npm start`를 실행하면 Node.js가 `app.js`를 시작한다. 운영 프로세스를 PM2로 관리하는 경우에도 같은 작업 디렉터리와 진입점을 사용한다.

`server/.env`의 DB 연결을 OCI의 MySQL에 맞추고 JWT, 이메일 발송, CORS 설정을 확인한다. DB에 이관한 파일은 `server/routes/files.js`에서 제공한다. 업로드 한도와 보안 변경 배포 시 유의사항은 [서버 실행 문서](../server/README.md)를 참고한다.
