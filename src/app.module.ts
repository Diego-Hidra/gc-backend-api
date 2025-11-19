import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentModule } from './modules/resident.module';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.DB_PORT || '5342', 10),
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,

      entities: [
        __dirname + '/**/*.entity{.ts,.js}', 
      ],

      synchronize: true
    }),
    ResidentModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
