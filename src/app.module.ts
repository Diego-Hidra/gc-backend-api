import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentModule } from './modules/resident.module';
import { AuthModule } from './modules/auth.module';
import { QrModule } from './modules/qr.module';
import { VisitorModule } from './modules/visitor.module';
import { InvitationModule } from './modules/invitation.module';
import { VehicleModule } from './modules/vehicle.module';
import { FrequentVisitorModule } from './modules/frequent-visitor.module';
import { LogModule } from './modules/log.module';
import { EntryLogModule } from './modules/entry-log.module';

import { ConfigModule } from '@nestjs/config';
import { EmbeddingModule } from './modules/embedding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432', 10),
      username: process.env.PG_USER,
      password: process.env.PG_PASS,
      database: process.env.PG_DB,
      extra: {
        client_encoding: 'UTF8',
      },

      entities: [
        __dirname + '/**/*.entity{.ts,.js}', 
      ],

      dropSchema: false,
      synchronize: false
    }),
    AuthModule, // Debe ir primero para exportar JwtStrategy globalmente
    ResidentModule,
    EmbeddingModule, 
    QrModule, 
    VisitorModule, 
    InvitationModule, 
    VehicleModule, 
    FrequentVisitorModule, 
    LogModule,
    EntryLogModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
