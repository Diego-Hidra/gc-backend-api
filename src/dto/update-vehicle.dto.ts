import { IsString, IsNumber, IsEnum, IsOptional, Matches, Min, Max } from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{4}-[0-9]{2}$/, {
    message: 'La patente debe tener el formato chileno: XXXX-XX (4 letras mayúsculas, guión, 2 números)',
  })
  licensePlate?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  @Min(1900, { message: 'El año debe ser mayor o igual a 1900' })
  @Max(new Date().getFullYear(), { message: 'El año no puede ser mayor al año actual' })
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(VehicleType, {
    message: 'El tipo debe ser uno de: SEDAN, SUV, HATCHBACK, PICKUP, VAN, MOTORCYCLE, OTHER',
  })
  @IsOptional()
  type?: VehicleType;

  @IsString()
  @IsOptional()
  notes?: string;
}
