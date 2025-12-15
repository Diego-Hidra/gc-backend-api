import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { PythonShell } from 'python-shell';
import * as path from 'path';

interface PythonResponse {
  success: boolean;
  message?: string;
  embedding?: number[];
  dimension?: number;
}

@Injectable()
export class GenerateEmbeddingService {
  private readonly logger = new Logger(GenerateEmbeddingService.name);

  async generateEmbedding(imageUrl: string): Promise<number[]> {
    const scriptPath = path.resolve(__dirname, '../../scripts');
    const scriptName = 'embeddings.py';

    const options = {
      mode: 'text' as const,
      pythonPath: 'python3',
      scriptPath: scriptPath,
      args: [imageUrl]
    };

    this.logger.log(`Ejecutando IA para: ${imageUrl}`);

    return new Promise((resolve, reject) => {
      PythonShell.run(scriptName, options).then(messages => {
        // Tomamos el último mensaje 
        if (!messages || messages.length === 0) {
          reject(new InternalServerErrorException('El script de Python no retornó ninguna respuesta.'));
          return;
        }

        try {
          const lastMessage = messages[messages.length - 1];
          const result: PythonResponse = JSON.parse(lastMessage);

          if (result.success && result.embedding) {
            resolve(result.embedding);
          } else {
            this.logger.warn(`Error en Python: ${result.message}`);
            // Si es un error de lógica, lanzamos Bad Request
            reject(new BadRequestException(result.message || 'Error procesando la imagen'));
          }
        } catch (error) {
          this.logger.error(`Error parseando JSON de Python: ${messages}`);
          reject(new InternalServerErrorException('Error interno al leer la respuesta de la IA'));
        }
      }).catch(err => {
        this.logger.error(`Fallo crítico al ejecutar PythonShell: ${err.message}`);
        reject(new InternalServerErrorException('No se pudo ejecutar el script de reconocimiento facial.'));
      });
    });
  }
}