import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Log, LogType, LogAction } from '../entities/log.entity';
import { CreateLogDto } from '../dto/create-log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  /**
   * Crear un nuevo log
   */
  async createLog(createLogDto: CreateLogDto): Promise<Log> {
    const log = this.logRepository.create({
      ...createLogDto,
      severity: createLogDto.severity || 'info',
      timestamp: new Date(),
    });

    return await this.logRepository.save(log);
  }

  /**
   * Obtener logs del día actual filtrados por tipo
   */
  async getLogsPerDay(logType: LogType): Promise<{
    logs: Log[];
    total: number;
    date: string;
    type: LogType;
  }> {
    // Obtener inicio y fin del día actual
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar logs del día por tipo
    const [logs, total] = await this.logRepository.findAndCount({
      where: {
        type: logType,
        timestamp: Between(startOfDay, endOfDay),
      },
      relations: ['user'],
      order: {
        timestamp: 'DESC',
      },
    });

    return {
      logs,
      total,
      date: startOfDay.toISOString().split('T')[0],
      type: logType,
    };
  }

  /**
   * Obtener todos los logs con paginación y filtros
   */
  async getAllLogs(
    logType?: LogType,
    page: number = 1,
    limit: number = 50,
    action?: LogAction,
    severity?: string,
    userId?: string,
    entityType?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    logs: Log[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: any;
  }> {
    const skip = (page - 1) * limit;

    // Construir query dinámica
    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    // Aplicar filtros
    const filters: any = {};

    if (logType) {
      queryBuilder.andWhere('log.type = :logType', { logType });
      filters.type = logType;
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
      filters.action = action;
    }

    if (severity) {
      queryBuilder.andWhere('log.severity = :severity', { severity });
      filters.severity = severity;
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
      filters.userId = userId;
    }

    if (entityType) {
      queryBuilder.andWhere('log.entityType = :entityType', { entityType });
      filters.entityType = entityType;
    }

    if (startDate) {
      queryBuilder.andWhere('log.timestamp >= :startDate', { startDate });
      filters.startDate = startDate;
    }

    if (endDate) {
      queryBuilder.andWhere('log.timestamp <= :endDate', { endDate });
      filters.endDate = endDate;
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters,
    };
  }

  /**
   * Obtener log por ID
   */
  async getLogById(id: string): Promise<Log> {
    const log = await this.logRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException(`Log con ID ${id} no encontrado`);
    }

    return log;
  }

  /**
   * Obtener logs por usuario
   */
  async getLogsByUser(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    logs: Log[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await this.logRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
      skip,
      take: limit,
    });

    return {
      logs,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener logs por entidad
   */
  async getLogsByEntity(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    logs: Log[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await this.logRepository.findAndCount({
      where: {
        entityType,
        entityId,
      },
      relations: ['user'],
      order: { timestamp: 'DESC' },
      skip,
      take: limit,
    });

    return {
      logs,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener estadísticas de logs
   */
  async getLogStats(startDate?: Date, endDate?: Date): Promise<{
    totalLogs: number;
    byType: Record<LogType, number>;
    bySeverity: Record<string, number>;
    byAction: Record<LogAction, number>;
    recentErrors: Log[];
    dateRange: { start: Date; end: Date };
  }> {
    const queryBuilder = this.logRepository.createQueryBuilder('log');

    if (startDate) {
      queryBuilder.andWhere('log.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.timestamp <= :endDate', { endDate });
    }

    const logs = await queryBuilder.getMany();

    // Contar por tipo
    const byType: any = {};
    Object.values(LogType).forEach((type) => {
      byType[type] = logs.filter((log) => log.type === type).length;
    });

    // Contar por severidad
    const bySeverity: any = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    };
    logs.forEach((log) => {
      if (bySeverity.hasOwnProperty(log.severity)) {
        bySeverity[log.severity]++;
      }
    });

    // Contar por acción (top 10)
    const actionCounts: any = {};
    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    // Obtener errores recientes
    const recentErrors = await this.logRepository.find({
      where: [{ severity: 'error' }, { severity: 'critical' }],
      relations: ['user'],
      order: { timestamp: 'DESC' },
      take: 10,
    });

    return {
      totalLogs: logs.length,
      byType,
      bySeverity,
      byAction: actionCounts,
      recentErrors,
      dateRange: {
        start: startDate || logs[logs.length - 1]?.timestamp || new Date(),
        end: endDate || logs[0]?.timestamp || new Date(),
      },
    };
  }

  /**
   * Eliminar logs antiguos (limpieza periódica)
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<{
    deleted: number;
    message: string;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.logRepository
      .createQueryBuilder()
      .delete()
      .from(Log)
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    return {
      deleted: result.affected || 0,
      message: `Logs anteriores a ${cutoffDate.toISOString()} eliminados`,
    };
  }

  /**
   * Método auxiliar para crear logs automáticamente desde otros servicios
   */
  async log(
    type: LogType,
    action: LogAction,
    description: string,
    options?: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      details?: Record<string, any>;
      metadata?: Record<string, any>;
      severity?: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<Log> {
    return await this.createLog({
      type,
      action,
      description,
      ...options,
    });
  }
}
