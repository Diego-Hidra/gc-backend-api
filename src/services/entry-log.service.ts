import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { EntryLog, EntryMethod } from '../entities/entry-log.entity';

@Injectable()
export class EntryLogService {
  constructor(
    @InjectRepository(EntryLog)
    private readonly entryLogRepository: Repository<EntryLog>,
  ) {}

  // --- Constantes para simplificar las consultas ---
  // Agrupamos los métodos faciales para tratarlos como un solo sistema (éxito, no match, error ocr)
  private readonly FACIAL_SYSTEM_METHODS = [
    EntryMethod.FACIAL,
    EntryMethod.NFACIAL,
    EntryMethod.UFACIAL,
  ];

  private readonly VEHICLE_METHODS = [
    EntryMethod.LPR,
    EntryMethod.NLP,
    EntryMethod.ULP,
  ];

  /**
   * Obtener últimos N entry logs de acceso personal
   * Se modificó: La parte facial ahora incluye FACIAL, NFACIAL y UFACIAL
   */
  async getLatestPersonalLogs(limit: number = 5): Promise<{
    success: boolean;
    data: { qr: EntryLog[]; facial: EntryLog[] };
    total: { qr: number; facial: number };
  }> {
    // Últimos de QR
    const qrLogs = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .leftJoinAndSelect('entry.invitation', 'invitation')
      .where('entry.entryMethod = :method', { method: EntryMethod.QR })
      .orderBy('entry.arrivalTime', 'DESC')
      .take(limit)
      .getMany();

    // Últimos de Sistema Facial (FACIAL, NFACIAL, UFACIAL)
    const facialLogs = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod IN (:...methods)', { methods: this.FACIAL_SYSTEM_METHODS })
      .orderBy('entry.arrivalTime', 'DESC')
      .take(limit)
      .getMany();

    return {
      success: true,
      data: { qr: qrLogs, facial: facialLogs },
      total: { qr: qrLogs.length, facial: facialLogs.length },
    };
  }

  /**
   * Obtener últimos N entry logs de vehículos (LPR, NLPR, ULPR)
   */
  async getLatestVehicleLogs(limit: number = 5): Promise<{
    success: boolean;
    data: EntryLog[];
    total: number;
  }> {
    const vehicleLogs = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.vehicle', 'vehicle')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod IN (:...methods)', { methods: this.VEHICLE_METHODS }) 
      .orderBy('entry.arrivalTime', 'DESC')
      .take(limit)
      .getMany();

    return {
      success: true,
      data: vehicleLogs,
      total: vehicleLogs.length,
    };
  }

  /**
   * Obtener entry logs del día - Personal (QR + Sistema Facial)
   */
  async getTodayPersonalLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    success: boolean;
    data: { qr: EntryLog[]; facial: EntryLog[] };
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

    const skip = (page - 1) * limit;

    // QR del día
    const [qrLogs, qrTotal] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .leftJoinAndSelect('entry.invitation', 'invitation')
      .where('entry.entryMethod = :method', { method: EntryMethod.QR })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('entry.arrivalTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Sistema Facial del día (Agrupado)
    const [facialLogs, facialTotal] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod IN (:...methods)', { methods: this.FACIAL_SYSTEM_METHODS })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('entry.arrivalTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: { qr: qrLogs, facial: facialLogs },
      meta: {
        qr: { total: qrTotal, page, limit, totalPages: Math.ceil(qrTotal / limit) },
        facial: { total: facialTotal, page, limit, totalPages: Math.ceil(facialTotal / limit) },
      },
      date: startOfDay.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener entry logs del día - Vehículos
   */
  async getTodayVehicleLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    success: boolean;
    data: EntryLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    date: string;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const skip = (page - 1) * limit;

    const [vehicleLogs, total] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.vehicle', 'vehicle')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod IN (:...methods)', { methods: this.VEHICLE_METHODS })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('entry.arrivalTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: vehicleLogs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      date: startOfDay.toISOString().split('T')[0],
    };
  }

  /**
   * Obtener entry logs de la semana - Personal (QR + Sistema Facial)
   */
  async getWeekPersonalLogs(
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    success: boolean;
    data: { qr: EntryLog[]; facial: EntryLog[] };
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

    const skip = (page - 1) * limit;

    // QR de la semana
    const [qrLogs, qrTotal] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .leftJoinAndSelect('entry.invitation', 'invitation')
      .where('entry.entryMethod = :method', { method: EntryMethod.QR })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('entry.arrivalTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Sistema Facial de la semana (Agrupado)
    const [facialLogs, facialTotal] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod IN (:...methods)', { methods: this.FACIAL_SYSTEM_METHODS })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('entry.arrivalTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: { qr: qrLogs, facial: facialLogs },
      meta: {
        qr: { total: qrTotal, page, limit, totalPages: Math.ceil(qrTotal / limit) },
        facial: { total: facialTotal, page, limit, totalPages: Math.ceil(facialTotal / limit) },
      },
      period: {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Estadísticas de entry logs
   * Se modificó: Tanto 'lpr' como 'facial' ahora cuentan sus respectivos grupos (Success, No Match, Error)
   */
  async getEntryStats(): Promise<{
    success: boolean;
    data: {
      today: { qr: number; facial: number; lpr: number; total: number };
      week: { qr: number; facial: number; lpr: number; total: number };
      activeVisitors: number;
    };
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const timeRangeToday = Between(startOfDay, new Date());
    const timeRangeWeek = Between(startOfWeek, new Date());

    // --- Estadísticas del día ---
    const todayQr = await this.entryLogRepository.count({
      where: { entryMethod: EntryMethod.QR, arrivalTime: timeRangeToday },
    });

    const todayFacial = await this.entryLogRepository.count({
      where: { entryMethod: In(this.FACIAL_SYSTEM_METHODS), arrivalTime: timeRangeToday },
    });

    const todayLpr = await this.entryLogRepository.count({
      where: { entryMethod: In(this.VEHICLE_METHODS), arrivalTime: timeRangeToday },
    });

    // --- Estadísticas de la semana ---
    const weekQr = await this.entryLogRepository.count({
      where: { entryMethod: EntryMethod.QR, arrivalTime: timeRangeWeek },
    });

    const weekFacial = await this.entryLogRepository.count({
      where: { entryMethod: In(this.FACIAL_SYSTEM_METHODS), arrivalTime: timeRangeWeek },
    });

    const weekLpr = await this.entryLogRepository.count({
      where: { entryMethod: In(this.VEHICLE_METHODS), arrivalTime: timeRangeWeek },
    });

    // Visitantes activos (sin checkout)
    const activeVisitors = await this.entryLogRepository
      .createQueryBuilder('entry')
      .where('entry.visitorId IS NOT NULL')
      .andWhere('entry.departureTime IS NULL')
      .getCount();

    return {
      success: true,
      data: {
        today: {
          qr: todayQr,
          facial: todayFacial,
          lpr: todayLpr,
          total: todayQr + todayFacial + todayLpr,
        },
        week: {
          qr: weekQr,
          facial: weekFacial,
          lpr: weekLpr,
          total: weekQr + weekFacial + weekLpr,
        },
        activeVisitors,
      },
    };
  }

  /**
   * Obtener todos los entry logs con filtros opcionales
   * Obtiene todos los métodos, incluidos los nuevos (LPR, NLPR, ULPR) si no se filtra por `method`.
   */
  async getAllEntryLogs(
    page: number = 1,
    limit: number = 50,
    method?: EntryMethod, // Si se pasa 'LPR', solo obtendrá los LPR puros.
    hasCheckOut?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    success: boolean;
    data: EntryLog[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      filters: Record<string, any>;
    };
  }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .leftJoinAndSelect('entry.vehicle', 'vehicle')
      .leftJoinAndSelect('entry.guard', 'guard')
      .leftJoinAndSelect('entry.invitation', 'invitation');

    const filters: Record<string, any> = {};

    // Filtrar por método de acceso
    if (method) {
      queryBuilder.andWhere('entry.entryMethod = :method', { method });
      filters.method = method;
    }

    // Filtrar por si tiene check-out o no
    if (hasCheckOut !== undefined) {
      if (hasCheckOut) {
        queryBuilder.andWhere('entry.departureTime IS NOT NULL');
      } else {
        queryBuilder.andWhere('entry.departureTime IS NULL');
      }
      filters.hasCheckOut = hasCheckOut;
    }

    // Filtrar por rango de fechas
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('entry.arrivalTime >= :startDate', { startDate: start });
      filters.startDate = startDate;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('entry.arrivalTime <= :endDate', { endDate: end });
      filters.endDate = endDate;
    }

    const [logs, total] = await queryBuilder
      .orderBy('entry.arrivalTime', 'DESC')
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

  /**
   * Obtener visitantes actualmente en la propiedad (sin checkout)
   */
  async getActiveVisitors(): Promise<{
    success: boolean;
    data: EntryLog[];
    total: number;
  }> {
    const activeLogs = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .leftJoinAndSelect('entry.invitation', 'invitation')
      .where('entry.visitorId IS NOT NULL')
      .andWhere('entry.departureTime IS NULL')
      .orderBy('entry.arrivalTime', 'DESC')
      .getMany();

    return {
      success: true,
      data: activeLogs,
      total: activeLogs.length,
    };
  }
}