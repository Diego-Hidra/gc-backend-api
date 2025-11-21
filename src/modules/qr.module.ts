import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resident } from '../entities/resident.entity';
import { Invitation } from '../entities/invitation.entity';
import { Visitor } from '../entities/visitor.entity';
import { QRService } from '../services/qr.service';
import { QRController } from '../controllers/qr.controller';
import { LogModule } from './log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resident, Invitation, Visitor]),
    LogModule, // Importar LogModule para usar LogService
  ],
  controllers: [QRController],
  providers: [QRService],
  exports: [QRService],
})
export class QRModule {}
