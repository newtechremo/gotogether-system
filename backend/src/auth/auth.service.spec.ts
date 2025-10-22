import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminUser, AdminRole } from '../entities/admin-user.entity';
import { Facility } from '../entities/facility.entity';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let adminUserRepository: Repository<AdminUser>;
  let facilityRepository: Repository<Facility>;
  let jwtService: JwtService;

  const mockAdminUser: AdminUser = {
    id: 1,
    username: 'admin',
    password: '$2b$10$hashedpassword',
    name: '관리자',
    phone: '010-1234-5678',
    role: AdminRole.SUPER_ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  const mockFacility = {
    id: 1,
    facilityCode: 'FAC001',
    facilityName: '서울시각장애인복지관',
    username: 'facility_seoul',
    password: '$2b$10$hashedpassword',
    managerName: '시설관리자',
    managerPhone: '010-9876-5432',
    address: '서울시 강남구',
    createdBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  } as Facility;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminUserRepository = module.get<Repository<AdminUser>>(
      getRepositoryToken(AdminUser),
    );
    facilityRepository = module.get<Repository<Facility>>(
      getRepositoryToken(Facility),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adminLogin', () => {
    it('should successfully login admin user', async () => {
      jest
        .spyOn(adminUserRepository, 'findOne')
        .mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.adminLogin({
        username: 'admin',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.username).toBe('admin');
      expect(result.user.role).toBe(AdminRole.SUPER_ADMIN);
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      jest.spyOn(adminUserRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.adminLogin({
          username: 'invalid',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      jest
        .spyOn(adminUserRepository, 'findOne')
        .mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.adminLogin({
          username: 'admin',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('facilityLogin', () => {
    it('should successfully login facility user', async () => {
      jest.spyOn(facilityRepository, 'findOne').mockResolvedValue(mockFacility);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.facilityLogin({
        username: 'facility_seoul',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.username).toBe('facility_seoul');
      expect(result.user.facilityId).toBe(1);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(facilityRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.facilityLogin({
          username: 'invalid',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'password123';
      const hashedPassword = '$2b$10$mockedHashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePassword(
        'password123',
        'hashedPassword',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should return false for non-matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePassword(
        'wrongpassword',
        'hashedPassword',
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword',
      );
    });
  });
});
