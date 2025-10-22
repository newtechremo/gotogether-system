# 환경 변수 설정 가이드

**작성 일시**: 2025-10-15
**프로젝트**: GoTogether Backend

---

## 📋 개요

NestJS 백엔드 애플리케이션의 환경 변수 설정 방법을 설명합니다.

### 사용 패키지
- `@nestjs/config` - NestJS 공식 환경 변수 관리 패키지

---

## 🔧 설정 완료 내역

### 1. **@nestjs/config 패키지 설치** ✅

```bash
npm install @nestjs/config
```

### 2. **ConfigModule 전역 설정** ✅

`src/app.module.ts`:
```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,      // 전역 모듈로 설정
      envFilePath: '.env',  // .env 파일 경로
    }),
    // ... 다른 모듈들
  ],
})
export class AppModule {}
```

### 3. **환경 변수 파일 업데이트** ✅

#### `.env` (실제 설정 파일)
```env
# Application
NODE_ENV=development
PORT=3000

# Database Configuration - MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=gt_db
DB_PASSWORD=gtpw1@3$
DB_NAME=gotogether

# JWT Configuration
JWT_SECRET=gotogether-secret-key-change-in-production-please
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

#### `.env.example` (템플릿 파일)
```env
# Application
NODE_ENV=development
PORT=3000

# Database Configuration - MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=gt_db
DB_PASSWORD=your_password_here
DB_NAME=gotogether

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# SMS Configuration (for OTP)
SMS_API_KEY=your-sms-api-key
SMS_SENDER=1234567890
```

---

## 📚 환경 변수 상세 설명

### Application 설정

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `NODE_ENV` | 실행 환경 | `development` | `development`, `production`, `test` |
| `PORT` | 서버 포트 | `3000` | `3000`, `8080` |

### Database 설정

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `DB_HOST` | MySQL 호스트 | `localhost` | `localhost`, `127.0.0.1` |
| `DB_PORT` | MySQL 포트 | `3306` | `3306` |
| `DB_USERNAME` | 데이터베이스 사용자명 | `gt_db` | `gt_db`, `root` |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | - | `yourpassword` |
| `DB_NAME` | 데이터베이스 이름 | `gotogether` | `gotogether`, `gotogether_test` |

⚠️ **중요**: `.env` 파일의 `DB_USERNAME`을 사용합니다 (~~DB_USER~~ 아님)

### JWT 설정

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `JWT_SECRET` | JWT 서명 비밀키 | - | `my-secret-key-123` |
| `JWT_EXPIRES_IN` | 토큰 만료 시간 | `24h` | `1h`, `7d`, `3600` (초) |

⚠️ **보안**: 프로덕션에서는 강력한 비밀키로 변경 필수!

### CORS 설정

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `CORS_ORIGIN` | 허용할 프론트엔드 URL | `*` | `http://localhost:3001` |

### SMS 설정 (선택)

| 변수명 | 설명 | 기본값 | 예시 |
|--------|------|--------|------|
| `SMS_API_KEY` | SMS API 키 | - | `your-api-key` |
| `SMS_SENDER` | 발신자 번호 | - | `1234567890` |

---

## 🚀 사용 방법

### 1. 초기 설정

#### 새로운 환경 설정
```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env

# .env 파일을 편집하여 실제 값 입력
nano .env  # 또는 vi, code 등
```

### 2. 코드에서 환경 변수 사용

#### 방법 1: process.env 직접 사용 (현재 방식)

```typescript
// src/config/database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'gt_db',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gotogether',
  // ...
};
```

#### 방법 2: ConfigService 사용 (권장)

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  someMethod() {
    const dbHost = this.configService.get<string>('DB_HOST');
    const dbPort = this.configService.get<number>('DB_PORT');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
  }
}
```

---

## 🔒 보안 주의사항

### 1. .env 파일 관리

```bash
# .gitignore에 .env 추가 (이미 추가됨)
.env
.env.local
.env.*.local
```

✅ `.env.example`만 Git에 커밋
❌ `.env` 파일은 절대 커밋 금지

### 2. 프로덕션 환경

#### 강력한 JWT_SECRET 생성
```bash
# 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 환경 변수 예시 (프로덕션)
```env
NODE_ENV=production
PORT=3000
DB_HOST=production-db.example.com
DB_USERNAME=prod_user
DB_PASSWORD=VeryStrongPassword!@#123
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://app.gotogether.kr
```

### 3. 민감 정보 보호

- ✅ 데이터베이스 비밀번호는 환경 변수로만 관리
- ✅ API 키는 별도의 비밀 관리 시스템 사용 권장 (AWS Secrets Manager, Vault 등)
- ✅ JWT_SECRET은 정기적으로 변경

---

## 🧪 테스트 환경 설정

### 테스트용 .env 파일

`test/.env.test`:
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=gt_db
DB_PASSWORD=gtpw1@3$
DB_NAME=gotogether_test
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h
```

### Jest 설정

`jest.config.js`:
```javascript
module.exports = {
  setupFiles: ['dotenv/config'], // .env 파일 로드
  // ...
};
```

---

## 📝 환경별 설정 파일

### Development (개발)
```bash
.env                    # 기본 개발 환경
.env.development.local  # 로컬 개발자별 설정
```

### Production (운영)
```bash
.env.production         # 운영 환경 설정
```

### Test (테스트)
```bash
.env.test               # 테스트 환경 설정
```

---

## 🐛 트러블슈팅

### 1. 환경 변수가 로드되지 않음

**증상**: `process.env.DB_USERNAME`이 `undefined`

**해결**:
```bash
# .env 파일 존재 확인
ls -la .env

# ConfigModule이 app.module.ts에 추가되었는지 확인
# isGlobal: true 설정 확인
```

### 2. TypeScript 타입 오류

**증상**: `Type 'string | undefined' is not assignable to type 'string'`

**해결**:
```typescript
// 기본값 제공
const port = parseInt(process.env.DB_PORT || '3306', 10);

// 또는 타입 단언
const jwtExpire = (process.env.JWT_EXPIRES_IN as string) || '24h';
```

### 3. DB_USER vs DB_USERNAME

**문제**: 이전에 `DB_USER`를 사용했으나 현재는 `DB_USERNAME` 사용

**해결**:
```bash
# .env 파일 업데이트
DB_USERNAME=gt_db  # ✅ 올바름
# DB_USER=gt_db    # ❌ 사용 안 함
```

### 4. CORS 에러

**증상**: 프론트엔드에서 API 호출 시 CORS 에러

**해결**:
```env
# .env 파일에 프론트엔드 URL 추가
CORS_ORIGIN=http://localhost:3001
```

---

## 📊 환경 변수 체크리스트

### 개발 환경 시작 전
- [ ] `.env` 파일 생성 (`.env.example` 복사)
- [ ] 데이터베이스 접속 정보 입력
- [ ] JWT_SECRET 설정
- [ ] CORS_ORIGIN 설정

### 프로덕션 배포 전
- [ ] 강력한 JWT_SECRET 생성
- [ ] 데이터베이스 프로덕션 정보 입력
- [ ] NODE_ENV=production 설정
- [ ] CORS_ORIGIN을 실제 도메인으로 변경
- [ ] `.env` 파일이 Git에 커밋되지 않았는지 확인

---

## 🔗 관련 문서

- [NestJS Config 공식 문서](https://docs.nestjs.com/techniques/configuration)
- [dotenv 문서](https://github.com/motdotla/dotenv)
- [TypeORM 환경 변수](https://typeorm.io/)

---

## 💡 Best Practices

### 1. 환경 변수 검증

```typescript
// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```

### 2. 타입 안전한 Config

```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
});
```

---

**작성자**: Backend Development Team
**최종 수정**: 2025-10-15
**문서 버전**: 1.0
