import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class GenerateQrDto {
  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @IsString()
  @IsOptional()
  validUntil?: string;

  @IsBoolean()
  @IsOptional()
  singleUse?: boolean;
}
