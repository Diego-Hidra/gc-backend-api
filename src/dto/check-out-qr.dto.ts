import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CheckOutQRDto {
  @IsString()
  @IsNotEmpty({ message: 'El código QR es requerido' })
  qrCode: string;

  @IsOptional()
  @IsString()
  guardId?: string; // ID del guardia que registra la salida

  @IsOptional()
  @IsString()
  gateLocation?: string; // Ubicación de la puerta/salida

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>; // Datos adicionales
}
