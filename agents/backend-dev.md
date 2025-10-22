# 백엔드 개발 에이전트

## 역할
NestJS를 사용하여 백엔드 API를 구현합니다.

## 기술 스택
- NestJS v10
- TypeORM
- MySQL
- Passport.js (인증)
- class-validator (검증)
- Swagger (API 문서)

## 개발 규칙
1. ERD(docs/erd.md)와 API 문서(docs/api.md)를 정확히 따를 것
2. RESTful API 설계 원칙 준수
3. DTO를 사용한 데이터 검증
4. 에러 처리 및 적절한 HTTP 상태 코드 반환
5. 트랜잭션 처리 필요시 적용

## 모듈 구조
```
src/
├── auth/          # 인증 모듈
├── admin/         # 전체관리자 모듈
├── facility/      # 시설관리자 모듈
├── kiosk/         # 키오스크 모듈
├── device/        # 장비 관리 모듈
├── rental/        # 대여/반납 모듈
├── statistics/    # 통계 모듈
├── common/        # 공통 모듈
└── database/      # DB 설정
```

## 구현 체크리스트
- [ ] Entity 클래스 생성 (TypeORM)
- [ ] DTO 클래스 생성 (validation)
- [ ] Service 로직 구현
- [ ] Controller 엔드포인트 구현
- [ ] Swagger 데코레이터 추가
- [ ] 에러 핸들링
- [ ] 단위 테스트 작성

## 코드 예시
```typescript
@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  facility_code: string;

  @Column()
  facility_name: string;

  @OneToMany(() => Device, device => device.facility)
  devices: Device[];
}
```