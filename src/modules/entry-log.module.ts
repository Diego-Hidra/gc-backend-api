import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryLogController } from '../controllers/entry-log.controller';
import { EntryLogService } from '../services/entry-log.service';
import { EntryLog } from '../entities/entry-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EntryLog])],
  controllers: [EntryLogController],
  providers: [EntryLogService],
  exports: [EntryLogService],
})
export class EntryLogModule {}
