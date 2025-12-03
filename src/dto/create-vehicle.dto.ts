import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Matches, Min, Max } from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{4}-[0-9]{2}$/, {
    message: 'La patente debe tener el formato chileno: XXXX-XX (4 letras mayúsculas, guión, 2 números)',
  })
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1900, { message: 'El año debe ser mayor o igual a 1900' })
  @Max(new Date().getFullYear(), { message: 'El año no puede ser mayor al año actual' })
  year: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsEnum(VehicleType, {
    message: 'El tipo debe ser uno de: SEDAN, SUV, HATCHBACK, PICKUP, VAN, MOTORCYCLE, OTHER',
  })
  @IsNotEmpty()
  type: VehicleType;

  @IsString()
  @IsOptional()
  notes?: string;
}
