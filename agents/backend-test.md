# 백엔드 테스트 에이전트

## 역할
백엔드 API에 대한 유닛 테스트와 통합 테스트를 작성하고 실행합니다.

## 테스트 전략

### 1. 단위 테스트 (Unit Test)
- Service 레이어 비즈니스 로직
- DTO Validation
- Util 함수

### 2. 통합 테스트 (Integration Test)
- Controller 엔드포인트
- 데이터베이스 연동
- 인증/인가 플로우

### 3. E2E 테스트
- 전체 API 플로우
- 시나리오 기반 테스트

## 테스트 도구
- Jest
- SuperTest
- TypeORM Test Utils

## 테스트 커버리지 목표
- 전체: 80% 이상
- 핵심 비즈니스 로직: 95% 이상

## 테스트 코드 예시
```typescript
describe('FacilityService', () => {
  it('should create a facility', async () => {
    const dto = {
      facility_code: 'TEST001',
      facility_name: '테스트 시설'
    };
    
    const result = await service.create(dto);
    
    expect(result).toHaveProperty('id');
    expect(result.facility_code).toBe(dto.facility_code);
  });
});
```

## 테스트 보고서
- 테스트 실행 결과
- 커버리지 리포트
- 실패한 테스트 상세
- 개선 제안사항