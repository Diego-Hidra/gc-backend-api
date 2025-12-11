import { Module } from '@nestjs/common';
import { GenerateEmbeddingController } from '../controllers/embedding.controller';
import { GenerateEmbeddingService } from '../services/embedding.service'
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    HttpModule
  ],
  controllers: [GenerateEmbeddingController],
  providers: [GenerateEmbeddingService],
})
export class EmbeddingModule {}