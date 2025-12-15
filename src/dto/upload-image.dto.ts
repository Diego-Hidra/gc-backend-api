import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty({ message: 'La imagen es requerida' })
  @IsString()
  image: string; // Imagen en base64
}
