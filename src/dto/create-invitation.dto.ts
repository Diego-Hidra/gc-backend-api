import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsDateString, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class VehicleInfoDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateInvitationDto {
  // Si se proporciona frequentVisitorId, se autocompletarán los datos del visitante
  @IsUUID()
  @IsOptional()
  frequentVisitorId?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  rut?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  hasVehicle?: boolean;

  @ValidateNested()
  @Type(() => VehicleInfoDto)
  @IsOptional()
  vehicleInfo?: VehicleInfoDto;

  @IsUUID()
  @IsOptional()
  visitorId?: string;
}
