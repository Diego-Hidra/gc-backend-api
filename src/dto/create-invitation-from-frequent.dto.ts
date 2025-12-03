import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateInvitationFromFrequentDto {
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsNotEmpty()
  visitPurpose: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
