import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrController } from 'src/controllers/qr.controller';
import { QrService } from 'src/services/qr.service';
import { Invitation } from 'src/entities/invitation.entity';
import { Visitor } from 'src/entities/visitor.entity';
import { Resident } from 'src/entities/resident.entity';
import { EntryLog } from 'src/entities/entry-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, Visitor, Resident, EntryLog]),
  ],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}