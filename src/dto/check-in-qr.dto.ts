import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CheckInQRDto {
  @IsString()
  @IsNotEmpty({ message: 'El código QR es requerido' })
  qrCode: string;

  @IsOptional()
  @IsString()
  guardId?: string; // ID del guardia que registra la entrada

  @IsOptional()
  @IsString()
  gateLocation?: string; // Ubicación de la puerta/entrada

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>; // Datos adicionales (temperatura, foto, etc.)
}
