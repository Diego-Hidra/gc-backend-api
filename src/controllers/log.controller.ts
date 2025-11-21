import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LogService } from '../services/log.service';
import { CreateLogDto } from '../dto/create-log.dto';
import { LogType, LogAction } from '../entities/log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  /**
   * POST /api/logs/create
   * Crear un nuevo log manualmente
   */
  @Post('logs/create')
  @HttpCode(HttpStatus.CREATED)
  async createLog(
    @Body(ValidationPipe) createLogDto: CreateLogDto,
  ) {
    const log = await this.logService.createLog(createLogDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Log creado exitosamente',
      data: log,
    };
  }

  /**
   * GET /api/logs/per_day/:log_type
   * Obtener logs del día actual por tipo
   */
  @Get('logs/per_day/:log_type')
  @HttpCode(HttpStatus.OK)
  async getLogsPerDay(
    @Param('log_type') logType: LogType,
  ) {
    const result = await this.logService.getLogsPerDay(logType);

    return {
      statusCode: HttpStatus.OK,
      message: `Logs del tipo ${logType} para el día de hoy`,
      data: result,
    };
  }

  /**
   * GET /api/logs/all/:log_type
   * Obtener todos los logs con filtros y paginación
   */
  @Get('logs/all/:log_type')
  @HttpCode(HttpStatus.OK)
  async getAllLogsByType(
    @Param('log_type') logType: LogType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('action') action?: LogAction,
    @Query('severity') severity?: string,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.logService.getAllLogs(
      logType,
      page,
      limit,
      action,
      severity,
      userId,
      entityType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Logs del tipo ${logType} obtenidos exitosamente`,
      data: result,
    };
  }

  /**
   * GET /api/logs/all
   * Obtener todos los logs sin filtro de tipo
   */
  @Get('logs/all')
  @HttpCode(HttpStatus.OK)
  async getAllLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('type') type?: LogType,
    @Query('action') action?: LogAction,
    @Query('severity') severity?: string,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.logService.getAllLogs(
      type,
      page,
      limit,
      action,
      severity,
      userId,
      entityType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Logs obtenidos exitosamente',
      data: result,
    };
  }

  /**
   * GET /api/logs/:id
   * Obtener un log por ID
   */
  @Get('logs/:id')
  @HttpCode(HttpStatus.OK)
  async getLogById(@Param('id') id: string) {
    const log = await this.logService.getLogById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Log encontrado',
      data: log,
    };
  }

  /**
   * GET /api/logs/user/:userId
   * Obtener logs por usuario
   */
  @Get('logs/user/:userId')
  @HttpCode(HttpStatus.OK)
  async getLogsByUser(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const result = await this.logService.getLogsByUser(userId, page, limit);

    return {
      statusCode: HttpStatus.OK,
      message: `Logs del usuario ${userId}`,
      data: result,
    };
  }

  /**
   * GET /api/logs/entity/:entityType/:entityId
   * Obtener logs por entidad
   */
  @Get('logs/entity/:entityType/:entityId')
  @HttpCode(HttpStatus.OK)
  async getLogsByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const result = await this.logService.getLogsByEntity(
      entityType,
      entityId,
      page,
      limit,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Logs de ${entityType} con ID ${entityId}`,
      data: result,
    };
  }

  /**
   * GET /api/logs/stats
   * Obtener estadísticas de logs
   */
  @Get('logs/stats')
  @HttpCode(HttpStatus.OK)
  async getLogStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.logService.getLogStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Estadísticas de logs obtenidas',
      data: result,
    };
  }

  /**
   * POST /api/logs/clean
   * Limpiar logs antiguos
   */
  @Post('logs/clean')
  @HttpCode(HttpStatus.OK)
  async cleanOldLogs(
    @Query('daysToKeep', new DefaultValuePipe(90), ParseIntPipe)
    daysToKeep: number,
  ) {
    const result = await this.logService.cleanOldLogs(daysToKeep);

    return {
      statusCode: HttpStatus.OK,
      message: 'Limpieza de logs completada',
      data: result,
    };
  }
}
