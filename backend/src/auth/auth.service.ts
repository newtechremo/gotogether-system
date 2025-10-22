import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';
import { Facility } from '../entities/facility.entity';
import { LoginDto } from '../common/dto/login.dto';
import {
  AuthResponseDto,
  UserResponseDto,
} from '../common/dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
    private jwtService: JwtService,
  ) {}

  /**
   * 전체관리자 로그인
   */
  async adminLogin(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    // Find admin user
    const admin = await this.adminUserRepository.findOne({
      where: { username, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: admin.id,
      username: admin.username,
      type: 'admin',
      role: admin.role,
      name: admin.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Prepare user response
    const userResponse: UserResponseDto = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      permissions: admin.role === 'super_admin' ? ['all'] : ['read', 'write'],
    };

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userResponse,
      expires_in: 3600,
    };
  }

  /**
   * 시설관리자 로그인
   */
  async facilityLogin(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    // Find facility
    const facility = await this.facilityRepository.findOne({
      where: { username, isActive: true },
    });

    if (!facility) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, facility.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: facility.id,
      username: facility.username,
      type: 'facility',
      facilityId: facility.id,
      facilityName: facility.facilityName,
      name: facility.managerName,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Prepare user response
    const userResponse: UserResponseDto = {
      id: facility.id,
      username: facility.username,
      name: facility.managerName,
      facilityId: facility.id,
      facilityName: facility.facilityName,
    };

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userResponse,
      expires_in: 3600,
    };
  }

  /**
   * 비밀번호 해싱
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 비밀번호 검증
   */
  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
