jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest'; 
import { getRepositoryToken } from '@nestjs/typeorm';
// Importamos las entidades reales para tipado y token
import { JwtService } from '@nestjs/jwt';
import { Admin } from 'src/entities/admin.entity';
import { UserRole } from 'src/entities/user.entity';
import { AuthModule } from 'src/modules/auth.module';
import { Guard } from 'src/entities/guard.entity';
import { Resident } from 'src/entities/resident.entity';
import { before } from 'node:test';
const mockResidentEmail = 'residente@ejemplo.com';
const mockPassword = 'secure123';
const mockResidentId = 'uuid-residente-12345';
const mockAccessToken = 'mocked-jwt-token-residente';
const mockHashedPassword = 'hashed_password_from_db';

const mockResidentEntity: Resident = {
  id: mockResidentId,
  email: mockResidentEmail,
  password: mockHashedPassword, 
  firstName: 'Javier',
  lastName: 'Perez',
  rut: '12345678-9',
  phone: '56912345678',
  role: UserRole.RESIDENT,
  isActive: true,
  block: 'A',
  lotNumber: '101',
  floor: '1',
  apartment: 'A',
  buildingId: 'uuid-building',
  faceVector: '',
  profilePicture: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockResidentRepository = {
  findOne: jest.fn(), 
};

const mockGuardRepository = { findOne: jest.fn().mockResolvedValue(null) };
const mockAdminRepository = { findOne: jest.fn().mockResolvedValue(null) };


const mockBcryptService = {
  compare: jest.fn(), 
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue(mockAccessToken), 
};

describe('AuthModule Integration with Database', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        })
        .overrideProvider(getRepositoryToken(Resident))
        .useValue(mockResidentRepository)

        .overrideProvider(getRepositoryToken(Guard))
        .useValue(mockGuardRepository)
        .overrideProvider(getRepositoryToken(Admin))
        .useValue(mockAdminRepository)
        .overrideProvider('BCRYPT_SERVICE') 
        .useValue(mockBcryptService)
        .overrideProvider(JwtService)
        .useValue(mockJwtService)
        .overrideProvider(ConfigService)
        .useValue({
         get: (key: string) => {
         if (key === 'JWT_SECRET') return 'test-secret';
         return null;
        },
        })
        .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });



    it('POST /api/auth - Successful login for resident', async () => {
        mockResidentRepository.findOne.mockResolvedValue(mockResidentEntity);

        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const response = await request(app.getHttpServer())
        .post('/api/auth')
        .send({ email: mockResidentEmail, password: mockPassword })
        .expect(201);

        expect(mockResidentRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockResidentEmail },
        });

        expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);

        expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
        sub: mockResidentId,
        email: mockResidentEmail,
        user_type: UserRole.RESIDENT,
        block: mockResidentEntity.block,
        lotNumber: mockResidentEntity.lotNumber,
        }),
     );

        expect(response.body.data).toHaveProperty('access_token');
    });

    it('POST /api/auth - Failed login for resident with incorrect email', async () => {

        mockResidentRepository.findOne.mockResolvedValue(null); 

        const response = await request(app.getHttpServer())
        .post('/api/auth')
        .send({ email: 'noexiste@ejemplo.com', password: mockPassword })
        .expect(401);

        expect(mockResidentRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockBcryptService.compare).not.toHaveBeenCalled();
        expect(mockJwtService.sign).not.toHaveBeenCalled();

        expect(response.body).toHaveProperty('message', 'Credenciales inválidas. Solo residentes pueden acceder.');

    });


});