import { IsNotEmpty, IsUrl } from 'class-validator';

export class GenerateEmbeddingDto {
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria.' })
  @IsUrl({}, { message: 'Debes proporcionar una URL válida (http o https).' })
  imageUrl: string;
}