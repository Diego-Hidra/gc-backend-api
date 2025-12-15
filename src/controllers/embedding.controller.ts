import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { GenerateEmbeddingService } from '../services/embedding.service';
import { GenerateEmbeddingDto } from 'src/dto/embedding.dto';

@Controller('v1/face')
export class GenerateEmbeddingController {
  constructor(private readonly embeddingService: GenerateEmbeddingService) {}

  @Post('embedding')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async generateEmbedding(@Body() dto: GenerateEmbeddingDto) {
    
    const embedding = await this.embeddingService.generateEmbedding(dto.imageUrl);

    return {
      success: true,
      message: 'Embedding generado correctamente.',
      data: {
        embedding: embedding,
        dimension: embedding.length
      }
    };
  }
}