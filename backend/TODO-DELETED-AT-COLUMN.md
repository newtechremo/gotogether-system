# deleted_at 컬럼 추가 완료! ✅

## 완료 상태 (2025-10-23)

`deleted_at` 컬럼이 데이터베이스에 성공적으로 추가되었고, 모든 코드가 업데이트되었습니다.

### 완료된 작업:
1. ✅ 데이터베이스에 `deleted_at` 컬럼 추가
2. ✅ `facility.entity.ts` (line 69-70): `deletedAt` 필드 활성화
3. ✅ `facility.service.ts` (line 50): `deletedAt IS NULL` 조건 활성화
4. ✅ `facility.service.ts` (line 179-188): 소프트 삭제 시 `deletedAt = new Date()` 사용
5. ✅ `facility.service.ts` (line 313): 비밀번호 재설정 시 `deletedAt: IsNull()` 조건 추가
6. ✅ `facility.service.ts` (line 9): `IsNull` import 추가

### 현재 동작:
- ✅ 비활성 시설(`isActive = false`)도 목록에 표시
- ✅ 비활성 시설 수정 가능
- ✅ 비활성 시설 비밀번호 재설정 가능
- ✅ 삭제된 시설(`deletedAt != null`)은 목록에서 제외
- ✅ 삭제된 시설은 수정/비밀번호 재설정 불가

---

## 데이터베이스에 deleted_at 컬럼 추가하는 방법

### 방법 1: SQL 파일 실행 (수동)

```bash
mysql -u root -p < backend/add-deleted-at-column.sql
```

또는 MySQL 클라이언트에서:
```sql
USE gotogether;

ALTER TABLE facilities
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER is_active;

DESC facilities;
```

### 방법 2: TypeORM 마이그레이션 (자동)

```bash
cd backend
npm run migration:run
```

---

## deleted_at 컬럼 추가 후 해야 할 작업

### 1. `backend/src/entities/facility.entity.ts` 수정

**Line 69-71**: 주석 제거
```typescript
// 주석 제거 전 (현재)
// TODO: deletedAt 컬럼 추가 후 활성화
// @Column({ type: 'timestamp', name: 'deleted_at', nullable: true, default: null })
// deletedAt: Date;

// 주석 제거 후 (목표)
@Column({ type: 'timestamp', name: 'deleted_at', nullable: true, default: null })
deletedAt: Date;
```

### 2. `backend/src/facility/facility.service.ts` 수정

#### 2-1. `findAll()` 메서드 (Line 49-51)

**변경 전 (현재):**
```typescript
// 임시: deletedAt 컬럼 추가 전까지는 모든 시설 표시
// TODO: deletedAt 컬럼 추가 후 활성화
// queryBuilder.andWhere('facility.deletedAt IS NULL');
```

**변경 후 (목표):**
```typescript
// 삭제되지 않은 시설만 표시
queryBuilder.andWhere('facility.deletedAt IS NULL');
```

#### 2-2. `remove()` 메서드 (Line 187-190)

**변경 전 (현재):**
```typescript
// 임시: deletedAt 대신 isActive를 false로
// TODO: deletedAt 컬럼 추가 후 변경
facility.isActive = false;
await this.facilityRepository.save(facility);
```

**변경 후 (목표):**
```typescript
// 소프트 삭제: deletedAt 설정
facility.deletedAt = new Date();
await this.facilityRepository.save(facility);
```

#### 2-3. `resetPassword()` 메서드 (Line 313-316)

**변경 전 (현재):**
```typescript
// 임시: deletedAt 컬럼이 추가될 때까지 id만으로 조회
const facility = await this.facilityRepository.findOne({
  where: { id: facilityId },
});
```

**변경 후 (목표):**
```typescript
// 삭제되지 않은 시설만 조회
const facility = await this.facilityRepository.findOne({
  where: { id: facilityId, deletedAt: null },
});
```

---

## 변경 후 기대 동작

- ✅ 비활성 시설(`isActive = false`)도 목록에 표시
- ✅ 비활성 시설 수정 가능
- ✅ 비활성 시설 비밀번호 재설정 가능
- ✅ 삭제된 시설(`deletedAt != null`)은 목록에서 제외
- ✅ 삭제된 시설 복원 가능 (필요시 `deletedAt = null`로 설정)

---

## 체크리스트

- [ ] 데이터베이스에 `deleted_at` 컬럼 추가
- [ ] `facility.entity.ts` 주석 제거 (line 70-71)
- [ ] `facility.service.ts` `findAll()` 주석 제거 (line 51)
- [ ] `facility.service.ts` `remove()` 변경 (line 189)
- [ ] `facility.service.ts` `resetPassword()` 변경 (line 315)
- [ ] 백엔드 빌드 및 테스트
- [ ] 시설 목록 조회 테스트
- [ ] 시설 삭제 테스트
- [ ] 비밀번호 재설정 테스트
