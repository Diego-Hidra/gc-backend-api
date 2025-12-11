import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryLogController } from '../controllers/entry-log.controller';
import { EntryLogService } from '../services/entry-log.service';
import { Log } from '../entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [EntryLogController],
  providers: [EntryLogService],
  exports: [EntryLogService],
})
export class EntryLogModule {}
