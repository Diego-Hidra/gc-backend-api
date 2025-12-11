import { IsNotEmpty, IsUrl } from "class-validator";

export class GenerateEmbeddingDto {
  @IsNotEmpty({ message: 'La URL de la imagen no puede estar vacía.' })
  @IsUrl({}, { message: 'El formato de la URL de la imagen es inválido (debe ser http o https).' })
  imageUrl: string;
}