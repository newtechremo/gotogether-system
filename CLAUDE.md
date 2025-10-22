# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GoTogether System** (가치봄플러스 통합 시스템) is a comprehensive assistive device rental management platform for the visually impaired. The system comprises three independent subsystems:

1. **Kiosk System** - Automated device rental/return at movie theaters
2. **Admin System** - Central management by the Korea Blind Union
3. **Facility Manager System** - Independent device management across 100+ network facilities

**Tech Stack:**
- Backend: NestJS (TypeScript), TypeORM, MySQL
- Frontend: Two separate applications (admin and facility portals)
- Database: MySQL with UTF-8MB4

## Key Commands

### Backend Development

```bash
cd backend

# Development
npm install              # Install dependencies
npm run start:dev        # Start in watch mode
npm run start:debug      # Start in debug mode

# Building & Production
npm run build            # Build the project
npm run start:prod       # Run production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run with coverage
npm run test:e2e         # Run e2e tests
npm run test:debug       # Debug tests

# Code Quality
npm run lint             # Lint and fix TypeScript files
npm run format           # Format code with Prettier
```

## Architecture & System Design

### Database Architecture

The system uses **three independent data domains** within a single MySQL database:

1. **Shared Tables**: `admin_users`, `facilities` - Used across all systems
2. **Kiosk Tables**: `kiosk_devices`, `kiosk_rentals` - Managed by kiosk + admin
3. **Facility Tables**: `facility_devices`, `facility_device_items`, `facility_rentals`, `facility_rental_devices`, `facility_repairs` - Independent per facility

**Critical Design Pattern**: The system maintains **separate device management** for kiosks and facilities:
- Kiosk devices use `kiosk_devices` with serial numbers and box assignments
- Facility devices use `facility_devices` (aggregate) + `facility_device_items` (individual items)

### Authentication & Authorization

Three distinct user types with different authentication flows:
- **Super Admin / Admin**: Login via `admin_users` table, full system access
- **Facility Manager**: Login via `facilities` table (username/password columns), scoped to their facility_id
- **Kiosk Users**: OTP-based phone authentication for temporary rental access

### Device Types (ENUM values)

Kiosk system:
- `AR_GLASS` - AR glasses
- `BONE_CONDUCTION` - Bone conduction earphones
- `SMARTPHONE` - Smartphones

Facility system (Korean):
- `AR글라스`
- `골전도 이어폰`
- `스마트폰`

### Key Business Logic

**Rental Process (Kiosk)**:
1. User requests OTP via phone number
2. OTP verification creates auth_token
3. Check available devices at specific kiosk
4. Create rental record linking device + renter
5. Open assigned box via hardware integration
6. Track until return

**Rental Process (Facility)**:
1. Facility manager creates rental record with borrower details
2. Select devices from available inventory
3. Support both individual and group rentals
4. Track detailed demographics (age, region, disability type, purpose)
5. Calculate rental period automatically (DATEDIFF + 1)
6. Update device status and quantities

**Overdue Management**:
- Kiosk rentals: Check `expected_return_datetime` against current time
- Facility rentals: Check `return_date` against current date
- Automated status updates via MySQL EVENT scheduler
- Admin dashboard shows overdue alerts with severity levels

## Important File Locations

- **API Documentation**: `docs/api.md` - Complete REST API specifications
- **Database Schema**: `docs/erd.md` - ERD, table definitions, indexes, triggers
- **Project Config**: `.claude/config.yaml` - Agent configuration and workflow

## Development Guidelines

### NestJS Module Structure

Follow NestJS best practices:
- Create feature modules (auth, rental, device, facility, statistics)
- Use DTOs for request/response validation with `class-validator`
- Implement guards for authentication/authorization
- Use TypeORM repositories for database access
- Leverage Swagger decorators for API documentation

### Database Queries

When writing TypeORM queries:
- Always filter by `facility_id` for facility-scoped data
- Use composite indexes (see `docs/erd.md` section 4)
- Be aware of the ENUM differences between kiosk and facility systems
- Respect the independent data domains - don't JOIN across kiosk/facility tables

### Testing Strategy

- Unit tests: Test services and business logic in isolation
- E2E tests: Located in `backend/test/`, use `jest-e2e.json` config
- Mock external dependencies (SMS OTP, kiosk hardware integration)
- Test both success and error scenarios (see error codes in `docs/api.md` section 6)

### Security Considerations

Per `docs/erd.md` section 7:
- Phone numbers: Mask as `010-****-****` in responses
- Passwords: Use bcrypt for hashing
- Sensitive data: AES-256 encryption
- All data mutations: Log to `system_logs` table with IP address

### Common Pitfalls

1. **Device Type Mismatches**: Kiosk uses English ENUMs, Facility uses Korean strings
2. **Facility Isolation**: Never expose data from other facilities to a facility manager
3. **Rental Status**: Different ENUM values for kiosk (`rented`, `returned`, `overdue`) vs facility (`대여중`, `반납완료`, `연체`)
4. **Date vs DateTime**: Kiosk uses DATETIME, Facility uses DATE for rental tracking
5. **Quantity Tracking**: Facility system tracks aggregate quantities in `facility_devices` - must update when devices change status

## API Development Reference

All endpoints follow this structure:
- Base URL (dev): `https://dev-api.gotogether.kr/v1`
- Kiosk APIs: `/kiosk/*`
- Admin APIs: `/admin/*`
- Facility APIs: `/facility/*`
- Statistics APIs: `/statistics/*`

Response format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error format (see `docs/api.md` section 6 for codes):
```json
{
  "success": false,
  "error": {
    "code": "RENTAL_001",
    "message": "Error description"
  }
}
```

## Database Schema Reference

Key relationships:
- `facilities` (1) → (N) `kiosk_devices`
- `facilities` (1) → (N) `facility_devices` (1) → (N) `facility_device_items`
- `facility_rentals` (1) → (N) `facility_rental_devices` → (N) `facility_device_items`
- `kiosk_devices` (1) → (N) `kiosk_rentals`

Auto-calculated fields:
- `facility_rentals.rental_weekday` - Trigger sets based on rental_date
- `facility_rentals.rental_period` - Generated column: DATEDIFF(return_date, rental_date) + 1

## Statistics & Reporting

Daily statistics tracked in `daily_statistics` table:
- Aggregate by `facility_id`, `stat_date`, `system_type`
- Separate counts for kiosk vs facility rentals
- Device type breakdown (AR glass, bone conduction, smartphone)
- Use for dashboard KPIs and historical reports

## WebSocket Integration (Future)

Planned for real-time updates:
- Kiosk status changes
- Rental/return events
- Device availability updates
- Connection: `ws://api.gotogether.com/ws`

## Performance Considerations

From `docs/erd.md` section 8:
- Use composite indexes for frequent query patterns
- Cache master data (region codes, disability types, rental purposes)
- Cache real-time rental status in Redis
- Partition `system_logs` by month, `daily_statistics` by year


## 중요지시

1. 목업은 완료된게아님. 목업으로 임시 작업한 경우 반드시 문서에 목업으로 작업되었음을 기록하고, 나중에 실제 데이터로 변경해야함.
2. 작성했던 코드는 최대한 삭제하지 않고, 백업파일 생성 후 새로운 코드를 작성할것.
3. Git commit message template 에 따라 작업 내용을 커밋할것
