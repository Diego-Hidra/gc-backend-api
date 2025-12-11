import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// Interfaz para el DTO de entrada
interface GenerateEmbeddingDto {
  imageUrl: string;
}
// Interfaz para la respuesta esperada del Microservicio Python
interface PythonEmbeddingResponse {
  success: boolean;
  message: string;
  embedding?: number[];
  dimension?: number;
}
@Injectable()
export class GenerateEmbeddingService {
  private readonly logger = new Logger(GenerateEmbeddingService.name);
  // URL donde corre el microservicio Flask/Python
  private readonly PYTHON_MICROSERVICE_URL = 'http://localhost:5000/api/v1/generate_embedding';
  constructor(private readonly httpService: HttpService) {}
  /**
   * Llama al microservicio de Python para generar el embedding facial.
   * @param data DTO con la URL de la imagen.
   * @returns El embedding facial (lista de números).
   */
  async generateEmbedding(data: GenerateEmbeddingDto): Promise<number[]> {
    this.logger.log(`Solicitando embedding para URL: ${data.imageUrl.substring(0, 50)}...`);
    try {
      // Usamos 'firstValueFrom' para convertir el Observable del HttpService en una Promise.
      const response = await firstValueFrom(
        this.httpService.post<PythonEmbeddingResponse>(
          this.PYTHON_MICROSERVICE_URL,
          // El cuerpo que Python espera es { "image_url": "..." }
          { image_url: data.imageUrl },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      const pythonResponse = response.data;
      
      if (pythonResponse.success && pythonResponse.embedding) {
        this.logger.log(`Embedding recibido. Dimensión: ${pythonResponse.dimension}`);
        return pythonResponse.embedding;
      } else {
        // Manejar errores como "No face detected" o "Error de descarga"
        this.logger.error(`Error del Microservicio Python: ${pythonResponse.message}`);
        throw new InternalServerErrorException(pythonResponse.message);
      }
    } catch (error) {
      this.logger.error(`Fallo en la comunicación con el servicio Python: ${error.message}`);
      // Lanza una excepción genérica de servidor para manejar errores de red/conexión.
      throw new InternalServerErrorException(
        `Error al contactar el servicio de IA. Asegúrate de que Flask esté corriendo en 5000.`,
      );
    }
  }
}