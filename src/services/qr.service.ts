import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from '../entities/invitation.entity';
import { Visitor, VisitorStatus } from '../entities/visitor.entity';
import { Resident } from '../entities/resident.entity';
import { EntryLog, EntryMethod } from '../entities/entry-log.entity';
import * as crypto from 'crypto';

interface VisitorQRData {
  invitationId: string;
  firstName: string;
  lastName: string;
  rut: string;
  phone?: string;
  email?: string;
  residentId: string;
  scheduledDate: string;
  hasVehicle: boolean;
  vehicleInfo?: {
    licensePlate: string;
    brand: string;
    model: string;
    color?: string;
  };
  notes?: string;
  timestamp: number;
}

interface ValidateVisitorQRResult {
  success: boolean;
  message: string;
  data?: {
    visitor: Visitor;
    invitation: Invitation;
    entryLog: EntryLog;
    validatedAt: string;
  };
}

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
    @InjectRepository(Resident)
    private residentRepository: Repository<Resident>,
    @InjectRepository(EntryLog)
    private entryLogRepository: Repository<EntryLog>,
  ) {}

  /**
   * Validar QR de visitante, crear visitor y registrar entry_log de ingreso
   */
  async validateVisitorQR(qrData: string, ipAddress?: string, userAgent?: string): Promise<ValidateVisitorQRResult> {
    console.log('\n🔍 [QrService] Validando QR de visitante...');

    // 1. Parsear datos del QR
    let parsedData: VisitorQRData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      console.error('❌ [QrService] Error al parsear QR:', error);
      throw new BadRequestException('Formato de QR inválido');
    }

    // 2. Validar que el QR tenga los campos requeridos
    if (!parsedData.invitationId || !parsedData.rut || !parsedData.residentId) {
      throw new BadRequestException('QR incompleto o corrupto - faltan campos requeridos');
    }

    // 3. Buscar la invitación
    const invitation = await this.invitationRepository.findOne({
      where: { id: parsedData.invitationId },
      relations: ['resident'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    // 4. Validar estado de la invitación
    if (invitation.status !== InvitationStatus.APPROVED) {
      throw new BadRequestException(`La invitación no está aprobada. Estado actual: ${invitation.status}`);
    }

    // 5. Verificar que la invitación no haya expirado
    const now = new Date();
    if (invitation.expirationDate && now > new Date(invitation.expirationDate)) {
      // Actualizar estado a expirado
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('La invitación ha expirado');
    }

    // 6. Verificar que el RUT coincida
    if (invitation.rut !== parsedData.rut) {
      throw new BadRequestException('El RUT no coincide con la invitación');
    }

    // 7. Crear el visitante
    const visitor = this.visitorRepository.create({
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      rut: parsedData.rut,
      phone: parsedData.phone || '',
      email: parsedData.email,
      status: VisitorStatus.IN_PROPERTY,
      scheduledDate: new Date(parsedData.scheduledDate),
      checkInTime: now,
      hasVehicle: parsedData.hasVehicle || false,
      vehicleInfo: parsedData.vehicleInfo,
      notes: parsedData.notes,
      residentId: parsedData.residentId,
    });

    const savedVisitor = await this.visitorRepository.save(visitor);
    console.log(`✅ [QrService] Visitante creado: ${savedVisitor.id}`);

    // 8. Actualizar la invitación como USADA y vincular el visitante
    invitation.status = InvitationStatus.USED;
    invitation.checkInTime = now;
    invitation.visitorId = savedVisitor.id;
    await this.invitationRepository.save(invitation);
    console.log(`✅ [QrService] Invitación marcada como usada: ${invitation.id}`);

    // 9. Crear entry_log de ingreso exitoso
    const entryLog = await this.createEntryLog({
      entryMethod: EntryMethod.QR,
      visitorId: savedVisitor.id,
      residentId: invitation.residentId,
      invitationId: invitation.id,
      arrivalTime: now,
      payload: {
        visitorName: `${parsedData.firstName} ${parsedData.lastName}`,
        visitorRut: parsedData.rut,
        residentName: invitation.resident ? `${invitation.resident.firstName} ${invitation.resident.lastName}` : null,
        hasVehicle: parsedData.hasVehicle,
        vehicleInfo: parsedData.vehicleInfo,
      },
      metadata: {
        ipAddress,
        userAgent,
        source: 'qr_validation',
      },
    });

    console.log(`✅ [QrService] Entry log creado: ${entryLog.id}`);

    return {
      success: true,
      message: 'Acceso autorizado - Visitante registrado correctamente',
      data: {
        visitor: savedVisitor,
        invitation: invitation,
        entryLog: entryLog,
        validatedAt: now.toISOString(),
      },
    };
  }

  /**
   * Registrar check-out de visitante
   */
  async checkOutVisitor(visitorId: string, ipAddress?: string, userAgent?: string): Promise<{
    success: boolean;
    message: string;
    data?: { visitor: Visitor; entryLog: EntryLog };
  }> {
    const visitor = await this.visitorRepository.findOne({
      where: { id: visitorId },
      relations: ['resident'],
    });

    if (!visitor) {
      throw new NotFoundException(`Visitante con ID ${visitorId} no encontrado`);
    }

    if (visitor.status !== VisitorStatus.IN_PROPERTY) {
      throw new BadRequestException(`El visitante no está en la propiedad. Estado actual: ${visitor.status}`);
    }

    const now = new Date();
    visitor.checkOutTime = now;
    visitor.status = VisitorStatus.COMPLETED;
    
    const updatedVisitor = await this.visitorRepository.save(visitor);

    // Buscar el entry_log de entrada y actualizar con la salida
    const existingEntryLog = await this.entryLogRepository.findOne({
      where: { visitorId: visitor.id },
      order: { arrivalTime: 'DESC' },
    });

    if (existingEntryLog) {
      // Actualizar el entry_log existente con la hora de salida
      existingEntryLog.departureTime = now;
      existingEntryLog.metadata = {
        ...existingEntryLog.metadata,
        checkOutIpAddress: ipAddress,
        checkOutUserAgent: userAgent,
        duration: visitor.checkInTime 
          ? Math.round((now.getTime() - visitor.checkInTime.getTime()) / 60000) + ' minutos'
          : null,
      };
      await this.entryLogRepository.save(existingEntryLog);

      return {
        success: true,
        message: 'Check-out registrado correctamente',
        data: {
          visitor: updatedVisitor,
          entryLog: existingEntryLog,
        },
      };
    }

    // Si no existe entry_log previo, crear uno nuevo con la salida
    const checkOutLog = await this.createEntryLog({
      entryMethod: EntryMethod.QR,
      visitorId: visitor.id,
      residentId: visitor.residentId,
      departureTime: now,
      payload: {
        visitorName: `${visitor.firstName} ${visitor.lastName}`,
        visitorRut: visitor.rut,
        residentName: visitor.resident ? `${visitor.resident.firstName} ${visitor.resident.lastName}` : null,
        action: 'check_out',
      },
      metadata: {
        ipAddress,
        userAgent,
        source: 'qr_checkout',
        checkInTime: visitor.checkInTime?.toISOString(),
        duration: visitor.checkInTime 
          ? Math.round((now.getTime() - visitor.checkInTime.getTime()) / 60000) + ' minutos'
          : null,
      },
    });

    return {
      success: true,
      message: 'Check-out registrado correctamente',
      data: {
        visitor: updatedVisitor,
        entryLog: checkOutLog,
      },
    };
  }

  /**
   * Validar QR de residente y registrar entry_log de ingreso
   */
  async validateResidentQR(
    residentId: string,
    expiration: number,
    signature: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      residentId: string;
      resident?: Resident;
      entryLog: EntryLog;
      validatedAt: string;
      expiresInMinutes: number;
      expiresAt: string;
    };
  }> {
    console.log('\n🔍 [QrService] Validando QR de residente...');

    const currentTime = Date.now();

    // 1. Verificar expiración
    if (currentTime > expiration) {
      const expiredMinutes = Math.floor((currentTime - expiration) / 60000);
      console.log(`❌ QR EXPIRADO hace ${expiredMinutes} minuto(s)`);
      throw new BadRequestException(`QR expirado hace ${expiredMinutes} minuto(s)`);
    }

    // 2. Verificar firma HMAC
    const QR_SECRET = process.env.QR_SECRET || '';
    const user_type = 'resident';
    const dataToHash = `${residentId}:${user_type}:${expiration}`;

    const expectedSignature = crypto
      .createHmac('sha256', QR_SECRET)
      .update(dataToHash)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log('❌ Firma HMAC inválida - QR adulterado');
      throw new BadRequestException('QR inválido o adulterado');
    }

    // 3. Buscar residente en la base de datos
    const resident = await this.residentRepository.findOne({
      where: { id: residentId },
    });

    const now = new Date();
    const remainingMinutes = Math.floor((expiration - currentTime) / 60000);

    // 4. Crear entry_log de ingreso
    const entryLog = await this.createEntryLog({
      entryMethod: EntryMethod.QR,
      residentId: residentId,
      arrivalTime: now,
      payload: {
        residentName: resident ? `${resident.firstName} ${resident.lastName}` : null,
        residentRut: resident?.rut,
        qrExpiresAt: new Date(expiration).toISOString(),
      },
      metadata: {
        ipAddress,
        userAgent,
        source: 'resident_qr_validation',
        remainingMinutes,
      },
    });

    console.log(`✅ QR VÁLIDO - Residente ID: ${residentId}, Expira en ${remainingMinutes} minuto(s)`);
    console.log(`✅ [QrService] Entry log creado: ${entryLog.id}`);

    return {
      success: true,
      message: 'QR válido - Acceso autorizado',
      data: {
        residentId,
        resident: resident || undefined,
        entryLog,
        validatedAt: now.toISOString(),
        expiresInMinutes: remainingMinutes,
        expiresAt: new Date(expiration).toISOString(),
      },
    };
  }

  /**
   * Helper para crear entry logs
   */
  private async createEntryLog(logData: {
    entryMethod: EntryMethod;
    visitorId?: string;
    residentId?: string;
    guardId?: string;
    vehicleId?: string;
    invitationId?: string;
    arrivalTime?: Date;
    departureTime?: Date;
    payload?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<EntryLog> {
    const entryLog = this.entryLogRepository.create(logData);
    return await this.entryLogRepository.save(entryLog);
  }
}
