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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE,

      entities: [
        __dirname + '/**/*.entity{.ts,.js}', 
      ],

      synchronize: true
    }),
    ResidentModule, 
    AuthModule, 
    QrModule, 
    VisitorModule, 
    InvitationModule, 
    VehicleModule, 
    FrequentVisitorModule, 
    LogModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
