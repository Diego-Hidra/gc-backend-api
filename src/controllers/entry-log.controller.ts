import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EntryLogService, AccessMethod } from '../services/entry-log.service';
import { LogAction } from '../entities/log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/entry-logs')
@UseGuards(JwtAuthGuard)
export class EntryLogController {
  constructor(private readonly entryLogService: EntryLogService) {}

  /**
   * GET /api/entry-logs/latest/personal
   * Obtener últimos 5 logs de acceso personal (QR + Facial)
   */
  @Get('latest/personal')
  @HttpCode(HttpStatus.OK)
  async getLatestPersonalLogs(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.entryLogService.getLatestPersonalLogs(Math.min(limit, 20));
  }

  /**
   * GET /api/entry-logs/latest/vehicle
   * Obtener últimos 5 logs de acceso por vehículo
   */
  @Get('latest/vehicle')
  @HttpCode(HttpStatus.OK)
  async getLatestVehicleLogs(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.entryLogService.getLatestVehicleLogs(Math.min(limit, 20));
  }

  /**
   * GET /api/entry-logs/today/personal
   * Obtener logs del día de acceso personal (QR + Facial) con paginación
   */
  @Get('today/personal')
  @HttpCode(HttpStatus.OK)
  async getTodayPersonalLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.entryLogService.getTodayPersonalLogs(page, Math.min(limit, 100));
  }

  /**
   * GET /api/entry-logs/today/vehicle
   * Obtener logs del día de acceso por vehículo con paginación
   */
  @Get('today/vehicle')
  @HttpCode(HttpStatus.OK)
  async getTodayVehicleLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.entryLogService.getTodayVehicleLogs(page, Math.min(limit, 100));
  }

  /**
   * GET /api/entry-logs/week/personal
   * Obtener logs de la semana de acceso personal (QR + Facial)
   */
  @Get('week/personal')
  @HttpCode(HttpStatus.OK)
  async getWeekPersonalLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.entryLogService.getWeekPersonalLogs(page, Math.min(limit, 200));
  }

  /**
   * GET /api/entry-logs/week/vehicle
   * Obtener logs de la semana de acceso por vehículo
   */
  @Get('week/vehicle')
  @HttpCode(HttpStatus.OK)
  async getWeekVehicleLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.entryLogService.getWeekVehicleLogs(page, Math.min(limit, 200));
  }

  /**
   * GET /api/entry-logs/all
   * Obtener todos los entry logs con filtros opcionales
   * 
   * Query params:
   * - page: número de página (default: 1)
   * - limit: registros por página (default: 50, max: 200)
   * - method: filtrar por método (qr, facial, vehicle_plate)
   * - action: filtrar por acción (check_in, check_out)
   * - startDate: fecha inicio (YYYY-MM-DD)
   * - endDate: fecha fin (YYYY-MM-DD)
   */
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllEntryLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('method') method?: AccessMethod,
    @Query('action') action?: LogAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.entryLogService.getAllEntryLogs(
      page,
      Math.min(limit, 200),
      method,
      action,
      startDate,
      endDate,
    );
  }
}
