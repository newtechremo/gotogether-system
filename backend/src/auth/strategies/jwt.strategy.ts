import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  username: string;
  type: 'admin' | 'facility';
  role?: string;
  facilityId?: number;
  facilityName?: string;
  name?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'gotogether-secret-key-change-in-production',
      ),
    });
  }

  /**
   * JWT 토큰 검증
   * 성능 최적화: DB 조회 없이 JWT 페이로드만 사용
   *
   * Note: 사용자 비활성화 시 즉시 반영되지 않음
   * 토큰 만료 전까지는 유효함 (보안과 성능의 트레이드오프)
   *
   * 실시간 상태 확인이 필요한 경우 Redis 캐싱 추가 고려
   */
  async validate(payload: JwtPayload) {
    if (payload.type === 'admin') {
      return {
        userId: payload.sub,
        username: payload.username,
        name: payload.name,
        role: payload.role,
        type: 'admin',
      };
    } else if (payload.type === 'facility') {
      return {
        userId: payload.sub,
        username: payload.username,
        name: payload.name,
        facilityId: payload.facilityId,
        facilityName: payload.facilityName,
        type: 'facility',
      };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}
