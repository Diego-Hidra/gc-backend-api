import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InvitationStatus } from '../entities/invitation.entity';

export class UpdateInvitationStatusDto {
  @IsEnum(InvitationStatus)
  @IsOptional()
  status?: InvitationStatus;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
