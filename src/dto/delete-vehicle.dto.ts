import { IsString, IsOptional } from 'class-validator';

export class DeleteVehicleDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
