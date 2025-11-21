import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from 'src/services/auth.service';
import { AuthController } from 'src/controllers/auth.controller';
import { User } from 'src/entities/user.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Resident } from 'src/entities/resident.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Resident]), 
    PassportModule, 
    ConfigModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({ 
        secret: configService.get<string>('JWT_SECRET')!, 
        signOptions: { 
          
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') as any, 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}