import { Module } from '@nestjs/common';
import { GenerateEmbeddingController } from '../controllers/embedding.controller';
import { GenerateEmbeddingService } from '../services/embedding.service';

@Module({
  controllers: [GenerateEmbeddingController],
  providers: [GenerateEmbeddingService],
  exports: [GenerateEmbeddingService], // Exportamos por si otro módulo necesita generar embeddings
})
export class EmbeddingModule {}