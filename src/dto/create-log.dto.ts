import { IsEnum, IsString, IsOptional, IsObject, MaxLength, IsIP } from 'class-validator';
import { LogType, LogAction } from '../entities/log.entity';

export class CreateLogDto {
  @IsEnum(LogType, {
    message: 'El tipo debe ser: access, visitor, vehicle, incident o system',
  })
  type: LogType;

  @IsEnum(LogAction, {
    message: 'La acción no es válida para el tipo de log especificado',
  })
  action: LogAction;

  @IsString()
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  entityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityId?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  userAgent?: string;

  @IsOptional()
  @IsEnum(['info', 'warning', 'error', 'critical'], {
    message: 'La severidad debe ser: info, warning, error o critical',
  })
  severity?: string;
}
