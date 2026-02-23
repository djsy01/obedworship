# 🔴 OBED Worship - Redis Configuration

> Redis 캐싱 및 세션 관리 가이드 (구현 예정)

---

## 현재 상태

Redis는 **사용자 정보 저장 + 세션 관리** 중심으로 설계되어 있습니다.
이 문서는 현 설계 기준의 키 구조와 운용 방식을 정리합니다.

---

## Redis 도입 목적

### 1. 사용자 정보 + 세션 관리
- 사용자 기본 정보 캐싱 (id/email/role 등)
- 로그인 세션 저장 및 만료 관리
- JWT 토큰 블랙리스트 관리 (선택)

### 키 구조 (권장)
```text
user:user_001        -> 사용자 정보 JSON
email:admin@obed.com -> user_001
session:abc123       -> 세션 JSON (TTL 적용)
```

### 2. 캐싱
- 자주 조회되는 데이터 캐싱
  - 집회 목록 (연도별)
  - 팀원 목록 (필터별)
  - 악보 목록 (페이지별)
- API 응답 캐싱

### 3. Rate Limiting
- API 요청 제한
- 파일 다운로드 제한
- Q&A 작성 제한

### 4. 실시간 통계
- 악보 다운로드 수 집계
- Q&A 답변 대기 수 집계
- 동시 접속자 수 추적

---

## 설치 및 설정

### 1. Redis 설치

#### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Docker
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

---

### 2. NestJS Redis 모듈 설치

```bash
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-store
npm install @types/cache-manager-redis-store --save-dev
```

또는 ioredis 사용:
```bash
npm install ioredis
npm install @types/ioredis --save-dev
```

---

## 환경 변수 설정

### `.env` 파일
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_SECRET=your-super-secret-session-key
SESSION_MAX_AGE=86400000  # 24 hours in milliseconds

# Cache TTL (Time To Live)
CACHE_TTL_SHORT=300       # 5 minutes
CACHE_TTL_MEDIUM=1800     # 30 minutes
CACHE_TTL_LONG=3600       # 1 hour
```

### Railway 배포 시
```env
REDIS_URL=redis://username:password@host:port
```

---

## NestJS 설정 예시

### 1. Redis 모듈 설정

#### `src/redis/redis.module.ts`
```typescript
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB'),
        ttl: configService.get('CACHE_TTL_MEDIUM'),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
```

---

### 2. 세션 관리

#### `src/auth/session.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class SessionService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // 세션 저장
  async setSession(userId: string, sessionData: any): Promise<void> {
    const key = `session:${userId}`;
    const ttl = 24 * 60 * 60; // 24 hours
    await this.redis.setex(key, ttl, JSON.stringify(sessionData));
  }

  // 세션 조회
  async getSession(userId: string): Promise<any> {
    const key = `session:${userId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // 세션 삭제 (로그아웃)
  async deleteSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.del(key);
  }

  // JWT 블랙리스트 추가
  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.redis.setex(key, expiresIn, '1');
  }

  // JWT 블랙리스트 확인
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const result = await this.redis.get(key);
    return result !== null;
  }
}
```

---

### 3. 데이터 캐싱

#### `src/worship/worship.service.ts`
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorshipService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 연도별 집회 목록 (캐싱)
  async findByYear(year: number) {
    const cacheKey = `worship:year:${year}`;

    // 캐시 확인
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // DB 조회
    const worships = await this.prisma.worship_logs.findMany({
      where: { year },
      include: {
        worship_songs: true,
        worship_videos: true,
        worship_photos: true,
        worship_scores: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // 캐시 저장 (30분)
    await this.cacheManager.set(cacheKey, worships, 1800);

    return worships;
  }

  // 집회 생성 시 캐시 무효화
  async create(createWorshipDto: CreateWorshipDto) {
    const worship = await this.prisma.worship_logs.create({
      data: createWorshipDto,
    });

    // 해당 연도 캐시 삭제
    const cacheKey = `worship:year:${worship.year}`;
    await this.cacheManager.del(cacheKey);

    return worship;
  }
}
```

---

### 4. Rate Limiting

#### `src/common/guards/rate-limit.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const key = `rate-limit:${userId}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      // 첫 요청: TTL 설정 (1분)
      await this.redis.expire(key, 60);
    }

    // 분당 최대 100회 요청 허용
    return current <= 100;
  }
}
```

---

## 주요 사용 케이스

### 1. 악보 다운로드 캐싱
```typescript
// 다운로드 횟수 실시간 집계
async incrementDownloadCount(scoreId: number): Promise<void> {
  const key = `score:downloads:${scoreId}`;
  await this.redis.incr(key);

  // 5분마다 DB에 반영
  const count = await this.redis.get(key);
  if (parseInt(count) % 10 === 0) {
    await this.prisma.scores.update({
      where: { id: scoreId },
      data: { download_count: { increment: 10 } },
    });
    await this.redis.decrby(key, 10);
  }
}
```

---

### 2. Q&A 통계 캐싱
```typescript
// Q&A 통계 캐싱
async getQnaStats() {
  const cacheKey = 'qna:stats';

  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  const stats = {
    total: await this.prisma.qna.count(),
    answered: await this.prisma.qna.count({ where: { status: 'ANSWERED' } }),
    waiting: await this.prisma.qna.count({ where: { status: 'WAITING' } }),
  };

  // 5분 캐싱
  await this.cacheManager.set(cacheKey, stats, 300);

  return stats;
}
```

---

### 3. 동시 접속자 수 추적
```typescript
// 접속자 추적
async trackActiveUser(userId: string): Promise<void> {
  const key = 'active:users';
  await this.redis.sadd(key, userId);
  await this.redis.expire(key, 300); // 5분 후 만료
}

// 접속자 수 조회
async getActiveUserCount(): Promise<number> {
  const key = 'active:users';
  return await this.redis.scard(key);
}
```

---

## 캐시 키 네이밍 규칙

### 패턴
```
{domain}:{resource}:{identifier}:{sub-resource}
```

### 예시
```
session:user:123
worship:year:2024
worship:detail:5
score:list:page:1
score:downloads:42
qna:stats
rate-limit:192.168.1.1
blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## TTL (Time To Live) 전략

| 데이터 유형 | TTL | 설명 |
|------------|-----|------|
| 세션 | 24시간 | 사용자 로그인 세션 |
| JWT 블랙리스트 | 토큰 만료시간 | 로그아웃된 토큰 |
| 집회 목록 | 30분 | 자주 변경되지 않음 |
| 팀원 목록 | 1시간 | 거의 변경되지 않음 |
| 악보 목록 | 30분 | 중간 빈도 변경 |
| Q&A 통계 | 5분 | 자주 변경됨 |
| Rate Limit | 1분 | 분당 요청 제한 |
| 다운로드 카운트 | 영구 | 주기적으로 DB 동기화 |

---

## 캐시 무효화 전략

### 1. 즉시 무효화
- 생성/수정/삭제 시 즉시 해당 캐시 삭제
```typescript
await this.cacheManager.del(`worship:detail:${id}`);
```

### 2. 패턴 기반 무효화
- 관련된 모든 캐시 삭제
```typescript
// 특정 연도의 모든 집회 캐시 삭제
const keys = await this.redis.keys('worship:year:2024:*');
if (keys.length > 0) {
  await this.redis.del(...keys);
}
```

### 3. TTL 기반 자동 만료
- 일정 시간 후 자동 삭제

---

## Redis CLI 주요 명령어

### 연결
```bash
redis-cli
redis-cli -h host -p port -a password
```

### 데이터 조회
```bash
# 모든 키 조회
KEYS *

# 특정 패턴 키 조회
KEYS session:*

# 값 조회
GET session:user:123

# 타입 확인
TYPE session:user:123

# TTL 확인
TTL session:user:123
```

### 데이터 삭제
```bash
# 특정 키 삭제
DEL session:user:123

# 모든 데이터 삭제 (주의!)
FLUSHDB

# 모든 DB 데이터 삭제 (주의!)
FLUSHALL
```

### 통계
```bash
# 서버 정보
INFO

# 메모리 사용량
INFO memory

# 키 개수
DBSIZE
```

---

## 모니터링

### 1. Redis 메모리 사용량 확인
```bash
redis-cli INFO memory | grep used_memory_human
```

### 2. 슬로우 쿼리 모니터링
```bash
redis-cli SLOWLOG GET 10
```

### 3. 실시간 명령어 모니터링
```bash
redis-cli MONITOR
```

---

## 성능 최적화

### 1. 파이프라이닝
```typescript
const pipeline = this.redis.pipeline();
pipeline.get('key1');
pipeline.get('key2');
pipeline.get('key3');
const results = await pipeline.exec();
```

### 2. 배치 작업
```typescript
// MGET - 여러 키 한 번에 조회
const values = await this.redis.mget('key1', 'key2', 'key3');

// MSET - 여러 키 한 번에 설정
await this.redis.mset('key1', 'value1', 'key2', 'value2');
```

### 3. 압축
- 큰 데이터는 압축하여 저장
```typescript
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

// 저장 시 압축
const compressed = await gzipAsync(JSON.stringify(data));
await this.redis.set(key, compressed);

// 조회 시 압축 해제
const compressed = await this.redis.getBuffer(key);
const decompressed = await gunzipAsync(compressed);
const data = JSON.parse(decompressed.toString());
```

---

## 보안

### 1. 비밀번호 설정
```bash
# redis.conf
requirepass your-strong-password
```

### 2. 네트워크 바인딩
```bash
# redis.conf
bind 127.0.0.1
```

### 3. 위험한 명령어 비활성화
```bash
# redis.conf
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
```

---

## 참고 문서
- [Redis Documentation](https://redis.io/docs/)
- [NestJS Cache Manager](https://docs.nestjs.com/techniques/caching)
- [ioredis Documentation](https://github.com/redis/ioredis)

---

## 향후 구현 계획

- [ ] NestJS Redis 모듈 설정
- [ ] 세션 관리 구현
- [ ] JWT 블랙리스트 구현
- [ ] 집회/악보 목록 캐싱
- [ ] Rate Limiting 구현
- [ ] 실시간 통계 구현
- [ ] Redis 모니터링 대시보드
