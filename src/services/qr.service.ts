import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from '../entities/invitation.entity';
import { Visitor, VisitorStatus } from '../entities/visitor.entity';
import { Resident } from '../entities/resident.entity';
import { Log, LogType, LogAction } from '../entities/log.entity';
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
    log: Log;
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
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  /**
   * Validar QR de visitante, crear visitor y registrar log de ingreso
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
      // Registrar intento fallido
      await this.createAccessLog({
        type: LogType.ACCESS,
        action: LogAction.ACCESS_DENIED,
        description: `Intento de acceso con invitación inexistente: ${parsedData.invitationId}`,
        severity: 'warning',
        details: { reason: 'invitation_not_found', qrData: parsedData },
        ipAddress,
        userAgent,
      });
      throw new NotFoundException('Invitación no encontrada');
    }

    // 4. Validar estado de la invitación
    if (invitation.status !== InvitationStatus.APPROVED) {
      await this.createAccessLog({
        type: LogType.ACCESS,
        action: LogAction.ACCESS_DENIED,
        description: `Intento de acceso con invitación en estado: ${invitation.status}`,
        userId: invitation.residentId,
        entityType: 'invitation',
        entityId: invitation.id,
        severity: 'warning',
        details: { 
          reason: 'invalid_invitation_status', 
          currentStatus: invitation.status,
          visitorName: `${parsedData.firstName} ${parsedData.lastName}`,
        },
        ipAddress,
        userAgent,
      });
      throw new BadRequestException(`La invitación no está aprobada. Estado actual: ${invitation.status}`);
    }

    // 5. Verificar que la invitación no haya expirado
    const now = new Date();
    if (invitation.expirationDate && now > new Date(invitation.expirationDate)) {
      // Actualizar estado a expirado
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);

      await this.createAccessLog({
        type: LogType.ACCESS,
        action: LogAction.ACCESS_DENIED,
        description: `Invitación expirada para ${parsedData.firstName} ${parsedData.lastName}`,
        userId: invitation.residentId,
        entityType: 'invitation',
        entityId: invitation.id,
        severity: 'warning',
        details: { 
          reason: 'invitation_expired',
          expirationDate: invitation.expirationDate,
          visitorName: `${parsedData.firstName} ${parsedData.lastName}`,
        },
        ipAddress,
        userAgent,
      });
      throw new BadRequestException('La invitación ha expirado');
    }

    // 6. Verificar que el RUT coincida
    if (invitation.rut !== parsedData.rut) {
      await this.createAccessLog({
        type: LogType.ACCESS,
        action: LogAction.ACCESS_DENIED,
        description: `RUT no coincide con la invitación`,
        userId: invitation.residentId,
        entityType: 'invitation',
        entityId: invitation.id,
        severity: 'warning',
        details: { 
          reason: 'rut_mismatch',
          expectedRut: invitation.rut,
          providedRut: parsedData.rut,
        },
        ipAddress,
        userAgent,
      });
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

    // 9. Crear log de ingreso exitoso
    const accessLog = await this.createAccessLog({
      type: LogType.ACCESS,
      action: LogAction.CHECK_IN,
      description: `Check-in de visitante: ${parsedData.firstName} ${parsedData.lastName} (${parsedData.rut})`,
      userId: invitation.residentId,
      entityType: 'visitor',
      entityId: savedVisitor.id,
      severity: 'info',
      details: {
        visitorId: savedVisitor.id,
        invitationId: invitation.id,
        visitorName: `${parsedData.firstName} ${parsedData.lastName}`,
        visitorRut: parsedData.rut,
        residentId: invitation.residentId,
        residentName: invitation.resident ? `${invitation.resident.firstName} ${invitation.resident.lastName}` : null,
        hasVehicle: parsedData.hasVehicle,
        vehicleInfo: parsedData.vehicleInfo,
        checkInTime: now.toISOString(),
      },
      ipAddress,
      userAgent,
    });

    console.log(`✅ [QrService] Log de acceso creado: ${accessLog.id}`);

    return {
      success: true,
      message: 'Acceso autorizado - Visitante registrado correctamente',
      data: {
        visitor: savedVisitor,
        invitation: invitation,
        log: accessLog,
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
    data?: { visitor: Visitor; log: Log };
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

    // Crear log de salida
    const checkOutLog = await this.createAccessLog({
      type: LogType.ACCESS,
      action: LogAction.CHECK_OUT,
      description: `Check-out de visitante: ${visitor.firstName} ${visitor.lastName} (${visitor.rut})`,
      userId: visitor.residentId,
      entityType: 'visitor',
      entityId: visitor.id,
      severity: 'info',
      details: {
        visitorId: visitor.id,
        visitorName: `${visitor.firstName} ${visitor.lastName}`,
        visitorRut: visitor.rut,
        residentId: visitor.residentId,
        residentName: visitor.resident ? `${visitor.resident.firstName} ${visitor.resident.lastName}` : null,
        checkInTime: visitor.checkInTime?.toISOString(),
        checkOutTime: now.toISOString(),
        duration: visitor.checkInTime 
          ? Math.round((now.getTime() - visitor.checkInTime.getTime()) / 60000) + ' minutos'
          : null,
      },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Check-out registrado correctamente',
      data: {
        visitor: updatedVisitor,
        log: checkOutLog,
      },
    };
  }

  /**
   * Helper para crear logs de acceso
   */
  private async createAccessLog(logData: {
    type: LogType;
    action: LogAction;
    description: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    severity: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Log> {
    const log = this.logRepository.create({
      ...logData,
      timestamp: new Date(),
    });
    return await this.logRepository.save(log);
  }
}
