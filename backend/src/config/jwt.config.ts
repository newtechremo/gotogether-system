import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret:
    process.env.JWT_SECRET || 'gotogether-secret-key-change-in-production',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
  },
};
