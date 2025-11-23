import { Module } from '@nestjs/common';
import { QrController } from 'src/controllers/qr.controller';

@Module({
  controllers: [QrController],
})
export class QrModule {}