import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty({ message: 'La imagen es requerida' })
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @Matches(/^data:image\/[a-z]+;base64,/, {
    message: 'El campo imagen debe ser una cadena Base64 válida con prefijo MIME. Formato: data:image/[tipo];base64,[datos]'
  })
  image: string; // Imagen en base64 con prefijo data:image/...;base64,...
}
