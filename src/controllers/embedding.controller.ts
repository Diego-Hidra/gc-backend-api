import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Logger, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { GenerateEmbeddingService } from '../services/embedding.service';
import { GenerateEmbeddingDto } from 'src/dto/embeddings.dto';

@Controller('v1/face')
export class GenerateEmbeddingController {
  private readonly logger = new Logger(GenerateEmbeddingController.name);

  constructor(private readonly embeddingService: GenerateEmbeddingService) {}

  @Post('embedding')
  @HttpCode(HttpStatus.OK)
  // Activamos validación estricta para este endpoint
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true })) 
  async generateEmbedding(@Body() body: GenerateEmbeddingDto) {
    this.logger.log(`[Petición Recibida] Generar embedding para: ${body.imageUrl}`);

    // Llamada al servicio
    const embedding = await this.embeddingService.generateEmbedding(body);

    // Respuesta
    return {
      success: true,
      message: 'Embedding generado y recuperado exitosamente.',
      embedding: embedding,
      dimension: embedding.length,
    };
  }
}