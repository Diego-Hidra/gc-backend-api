import { IsString, IsNotEmpty, IsEmail, IsOptional, ValidateNested } from 'class-validator';
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

export class CreateFrequentVisitorDto {
  @IsString()
  @IsNotEmpty()
  visitor_name: string;

  @IsString()
  @IsNotEmpty()
  visitor_dni: string;

  @IsString()
  @IsOptional()
  visitor_phone?: string;

  @IsEmail()
  @IsOptional()
  visitor_email?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @ValidateNested()
  @Type(() => VehicleInfoDto)
  @IsOptional()
  vehicleInfo?: VehicleInfoDto;
}
