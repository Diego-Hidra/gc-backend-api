import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentModule } from './modules/resident.module';
import { AuthModule } from './modules/auth.module';
import { LogModule } from './modules/log.module';
import { QRModule } from './modules/qr.module';
import { VisitorModule } from './modules/visitor.module';
import { InvitationModule } from './modules/invitation.module';
import { FrequentVisitorModule } from './modules/frequent-visitor.module';
import { VehicleModule } from './modules/vehicle.module';

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

      synchronize: false // Deshabilitado porque ya creamos las tablas manualmente
    }),
    ResidentModule,
    AuthModule,
    LogModule,
    QRModule,
    VisitorModule,
    InvitationModule,
    FrequentVisitorModule,
    VehicleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
