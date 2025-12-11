import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual } from 'typeorm';
import { Log, LogType, LogAction } from '../entities/log.entity';

export enum AccessMethod {
  QR = 'qr',
  FACIAL = 'facial',
  VEHICLE_PLATE = 'vehicle_plate',
}

@Injectable()
export class EntryLogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  /**
   * Obtener últimos N entry logs de acceso personal (QR + Facial)
   */
  async getLatestPersonalLogs(limit: number = 5): Promise<{
    success: boolean;
    data: { qr: Log[]; facial: Log[] };
    total: { qr: number; facial: number };
  }> {
    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];

    // Últimos 5 de QR
    const qrLogs = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.QR })
      .orderBy('log.timestamp', 'DESC')
      .take(limit)
      .getMany();

    // Últimos 5 de Facial
    const facialLogs = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.FACIAL })
      .orderBy('log.timestamp', 'DESC')
      .take(limit)
      .getMany();

    return {
      success: true,
      data: { qr: qrLogs, facial: facialLogs },
      total: { qr: qrLogs.length, facial: facialLogs.length },
    };
  }

  /**
   * Obtener últimos N entry logs de vehículos (patente)
   */
  async getLatestVehicleLogs(limit: number = 5): Promise<{
    success: boolean;
    data: Log[];
    total: number;
  }> {
    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];

    const vehicleLogs = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.VEHICLE_PLATE })
      .orderBy('log.timestamp', 'DESC')
      .take(limit)
      .getMany();

    return {
      success: true,
      data: vehicleLogs,
      total: vehicleLogs.length,
    };
  }

  /**
   * Obtener entry logs del día - Personal (QR + Facial) con paginación
   */
  async getTodayPersonalLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    success: boolean;
    data: { qr: Log[]; facial: Log[] };
    meta: {
      qr: { total: number; page: number; limit: number; totalPages: number };
      facial: { total: number; page: number; limit: number; totalPages: number };
    };
    date: string;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];
    const skip = (page - 1) * limit;

    // QR del día
    const [qrLogs, qrTotal] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.QR })
      .andWhere('log.timestamp BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Facial del día
    const [facialLogs, facialTotal] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.FACIAL })
      .andWhere('log.timestamp BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: { qr: qrLogs, facial: facialLogs },
      meta: {
        qr: {
          total: qrTotal,
          page,
          limit,
          totalPages: Math.ceil(qrTotal / limit),
        },
        facial: {
          total: facialTotal,
          page,
          limit,
          totalPages: Math.ceil(facialTotal / limit),
        },
      },
      date: startOfDay.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener entry logs del día - Vehículos con paginación
   */
  async getTodayVehicleLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    success: boolean;
    data: Log[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    date: string;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];
    const skip = (page - 1) * limit;

    const [vehicleLogs, total] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.VEHICLE_PLATE })
      .andWhere('log.timestamp BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: vehicleLogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      date: startOfDay.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener entry logs de la semana - Personal (QR + Facial)
   */
  async getWeekPersonalLogs(
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    success: boolean;
    data: { qr: Log[]; facial: Log[] };
    meta: {
      qr: { total: number; page: number; limit: number; totalPages: number };
      facial: { total: number; page: number; limit: number; totalPages: number };
    };
    period: { start: string; end: string };
  }> {
    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];
    const skip = (page - 1) * limit;

    // QR de la semana
    const [qrLogs, qrTotal] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.QR })
      .andWhere('log.timestamp BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Facial de la semana
    const [facialLogs, facialTotal] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.FACIAL })
      .andWhere('log.timestamp BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: { qr: qrLogs, facial: facialLogs },
      meta: {
        qr: {
          total: qrTotal,
          page,
          limit,
          totalPages: Math.ceil(qrTotal / limit),
        },
        facial: {
          total: facialTotal,
          page,
          limit,
          totalPages: Math.ceil(facialTotal / limit),
        },
      },
      period: {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Obtener entry logs de la semana - Vehículos
   */
  async getWeekVehicleLogs(
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    success: boolean;
    data: Log[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    period: { start: string; end: string };
  }> {
    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];
    const skip = (page - 1) * limit;

    const [vehicleLogs, total] = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions })
      .andWhere("log.details->>'method' = :method", { method: AccessMethod.VEHICLE_PLATE })
      .andWhere('log.timestamp BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: vehicleLogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      period: {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Obtener todos los entry logs (QR, Facial, Vehículos) con paginación
   */
  async getAllEntryLogs(
    page: number = 1,
    limit: number = 50,
    method?: AccessMethod,
    action?: LogAction,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    success: boolean;
    data: Log[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      filters: Record<string, any>;
    };
  }> {
    const accessActions = [LogAction.CHECK_IN, LogAction.CHECK_OUT];
    const accessMethods = [AccessMethod.QR, AccessMethod.FACIAL, AccessMethod.VEHICLE_PLATE];
    const skip = (page - 1) * limit;

    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.type = :type', { type: LogType.ACCESS })
      .andWhere('log.action IN (:...actions)', { actions: accessActions });

    const filters: Record<string, any> = {};

    // Filtrar por método de acceso específico o todos los métodos de entry
    if (method) {
      queryBuilder.andWhere("log.details->>'method' = :method", { method });
      filters.method = method;
    } else {
      queryBuilder.andWhere("log.details->>'method' IN (:...methods)", { methods: accessMethods });
    }

    // Filtrar por acción específica (check_in o check_out)
    if (action && accessActions.includes(action)) {
      queryBuilder.andWhere('log.action = :specificAction', { specificAction: action });
      filters.action = action;
    }

    // Filtrar por rango de fechas
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('log.timestamp >= :startDate', { startDate: start });
      filters.startDate = startDate;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('log.timestamp <= :endDate', { endDate: end });
      filters.endDate = endDate;
    }

    const [logs, total] = await queryBuilder
      .orderBy('log.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters,
      },
    };
  }
}
