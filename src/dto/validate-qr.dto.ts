import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateQRDto {
  @IsString()
  @IsNotEmpty({ message: 'El código QR es requerido' })
  qrCode: string;
}
