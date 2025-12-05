import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from 'src/services/auth.service';
import { AuthController } from 'src/controllers/auth.controller';
import { User } from 'src/entities/user.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Resident } from 'src/entities/resident.entity';
import { Guard } from 'src/entities/guard.entity';
import { Admin } from 'src/entities/admin.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Resident, Guard, Admin]), 
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    ConfigModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({ 
        secret: configService.get<string>('JWT_SECRET')!, 
        signOptions: { 
          
          expiresIn: configService.get<string>('JWT_EXPIRATION') as any, 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule, JwtStrategy],
})
export class AuthModule {}