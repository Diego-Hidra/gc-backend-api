import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EntryLog, EntryMethod } from '../entities/entry-log.entity';

@Injectable()
export class EntryLogService {
  constructor(
    @InjectRepository(EntryLog)
    private readonly entryLogRepository: Repository<EntryLog>,
  ) {}

  /**
   * Obtener últimos N entry logs de acceso personal (QR + Facial)
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

    // Últimos de Facial
    const facialLogs = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod = :method', { method: EntryMethod.FACIAL })
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
   * Obtener últimos N entry logs de vehículos (LPR - patente)
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
      .where('entry.entryMethod = :method', { method: EntryMethod.LPR })
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
   * Obtener entry logs del día - Personal (QR + Facial) con paginación
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

    // Facial del día
    const [facialLogs, facialTotal] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod = :method', { method: EntryMethod.FACIAL })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('entry.arrivalTime', 'DESC')
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
      .where('entry.entryMethod = :method', { method: EntryMethod.LPR })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .orderBy('entry.arrivalTime', 'DESC')
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

    // Facial de la semana
    const [facialLogs, facialTotal] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.visitor', 'visitor')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod = :method', { method: EntryMethod.FACIAL })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('entry.arrivalTime', 'DESC')
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
    data: EntryLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    period: { start: string; end: string };
  }> {
    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const skip = (page - 1) * limit;

    const [vehicleLogs, total] = await this.entryLogRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.vehicle', 'vehicle')
      .leftJoinAndSelect('entry.resident', 'resident')
      .where('entry.entryMethod = :method', { method: EntryMethod.LPR })
      .andWhere('entry.arrivalTime BETWEEN :start AND :end', { start: startOfWeek, end: endOfWeek })
      .orderBy('entry.arrivalTime', 'DESC')
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
   * Obtener todos los entry logs con filtros opcionales
   */
  async getAllEntryLogs(
    page: number = 1,
    limit: number = 50,
    method?: EntryMethod,
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

  /**
   * Obtener estadísticas de entry logs
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

    // Estadísticas del día
    const todayQr = await this.entryLogRepository.count({
      where: {
        entryMethod: EntryMethod.QR,
        arrivalTime: Between(startOfDay, new Date()),
      },
    });

    const todayFacial = await this.entryLogRepository.count({
      where: {
        entryMethod: EntryMethod.FACIAL,
        arrivalTime: Between(startOfDay, new Date()),
      },
    });

    const todayLpr = await this.entryLogRepository.count({
      where: {
        entryMethod: EntryMethod.LPR,
        arrivalTime: Between(startOfDay, new Date()),
      },
    });

    // Estadísticas de la semana
    const weekQr = await this.entryLogRepository.count({
      where: {
        entryMethod: EntryMethod.QR,
        arrivalTime: Between(startOfWeek, new Date()),
      },
    });

    const weekFacial = await this.entryLogRepository.count({
      where: {
        entryMethod: EntryMethod.FACIAL,
        arrivalTime: Between(startOfWeek, new Date()),
      },
    });

    const weekLpr = await this.entryLogRepository.count({
      where: {
        entryMethod: EntryMethod.LPR,
        arrivalTime: Between(startOfWeek, new Date()),
      },
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
}
