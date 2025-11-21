import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from '../entities/resident.entity';
import { Invitation } from '../entities/invitation.entity';
import { Visitor } from '../entities/visitor.entity';
import { LogService } from './log.service';
import { LogType, LogAction } from '../entities/log.entity';
import { InvitationStatus } from '../entities/invitation.entity';
import { VisitorStatus } from '../entities/visitor.entity';

export enum QRType {
  RESIDENT = 'resident',
  INVITATION = 'invitation',
}

@Injectable()
export class QRService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentRepository: Repository<Resident>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
    private readonly logService: LogService,
  ) {}

  /**
   * Validar QR sin registrar acción (solo verificación)
   */
  async validateQR(qrCode: string): Promise<{
    isValid: boolean;
    type: QRType | null;
    data: any;
    message: string;
  }> {
    // Intentar decodificar el QR
    let decoded: any;
    try {
      decoded = JSON.parse(Buffer.from(qrCode, 'base64').toString('utf-8'));
    } catch (error) {
      return {
        isValid: false,
        type: null,
        data: null,
        message: 'Código QR inválido o corrupto',
      };
    }

    // Validar QR de Residente
    if (decoded.type === QRType.RESIDENT) {
      const resident = await this.residentRepository.findOne({
        where: { rut: decoded.rut },
      });

      if (!resident) {
        return {
          isValid: false,
          type: QRType.RESIDENT,
          data: decoded,
          message: 'Residente no encontrado',
        };
      }

      return {
        isValid: true,
        type: QRType.RESIDENT,
        data: {
          residentId: resident.id,
          rut: resident.rut,
          name: resident.firstName,
          lastName: resident.lastName,
          address: resident.block,
          numberOfHouse: resident.lotNumber,
        },
        message: 'QR de residente válido',
      };
    }

    // Validar QR de Invitación
    if (decoded.type === QRType.INVITATION) {
      const invitation = await this.invitationRepository.findOne({
        where: { id: decoded.invitationId },
        relations: ['resident', 'visitor'],
      });

      if (!invitation) {
        return {
          isValid: false,
          type: QRType.INVITATION,
          data: decoded,
          message: 'Invitación no encontrada',
        };
      }

      // Verificar estado
      if (invitation.status === InvitationStatus.CANCELLED) {
        return {
          isValid: false,
          type: QRType.INVITATION,
          data: { invitation },
          message: 'Invitación cancelada',
        };
      }

      if (invitation.status === InvitationStatus.REJECTED) {
        return {
          isValid: false,
          type: QRType.INVITATION,
          data: { invitation },
          message: 'Invitación rechazada',
        };
      }

      if (invitation.status === InvitationStatus.USED) {
        return {
          isValid: false,
          type: QRType.INVITATION,
          data: { invitation },
          message: 'Invitación ya utilizada',
        };
      }

      if (invitation.status === InvitationStatus.EXPIRED) {
        return {
          isValid: false,
          type: QRType.INVITATION,
          data: { invitation },
          message: 'Invitación expirada',
        };
      }

      // Verificar fecha de expiración
      if (invitation.expirationDate && new Date() > invitation.expirationDate) {
        await this.invitationRepository.update(invitation.id, {
          status: InvitationStatus.EXPIRED,
        });
        return {
          isValid: false,
          type: QRType.INVITATION,
          data: { invitation },
          message: 'Invitación expirada',
        };
      }

      return {
        isValid: true,
        type: QRType.INVITATION,
        data: {
          invitationId: invitation.id,
          visitorName: invitation.visitorName,
          visitorRut: invitation.visitorRut,
          scheduledDate: invitation.scheduledDate,
          resident: {
            id: invitation.resident.id,
            name: invitation.resident.firstName,
            lastName: invitation.resident.lastName,
            address: invitation.resident.block,
            numberOfHouse: invitation.resident.lotNumber,
          },
          visitor: invitation.visitor
            ? {
                id: invitation.visitor.id,
                firstName: invitation.visitor.firstName,
                lastName: invitation.visitor.lastName,
              }
            : null,
        },
        message: 'QR de invitación válido',
      };
    }

    return {
      isValid: false,
      type: null,
      data: decoded,
      message: 'Tipo de QR no reconocido',
    };
  }

  /**
   * Check-in: Registrar entrada mediante QR
   */
  async checkIn(
    qrCode: string,
    guardId?: string,
    gateLocation?: string,
    additionalData?: Record<string, any>,
  ): Promise<{
    success: boolean;
    type: QRType;
    message: string;
    data: any;
  }> {
    // Validar QR primero
    const validation = await this.validateQR(qrCode);

    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }

    const checkInTime = new Date();

    // Check-in de Residente
    if (validation.type === QRType.RESIDENT) {
      const resident = await this.residentRepository.findOne({
        where: { rut: validation.data.rut },
      });

      if (!resident) {
        throw new NotFoundException('Residente no encontrado');
      }

      // Registrar log
      await this.logService.log(
        LogType.ACCESS,
        LogAction.CHECK_IN,
        `Residente ${resident.firstName} ${resident.lastName} ingresó a la comunidad`,
        {
          userId: resident.id,
          entityType: 'resident',
          entityId: resident.id,
          details: {
            rut: resident.rut,
            address: resident.block,
            numberOfHouse: resident.lotNumber,
            guardId,
            gateLocation,
            ...additionalData,
          },
          severity: 'info',
        },
      );

      return {
        success: true,
        type: QRType.RESIDENT,
        message: `Check-in exitoso: ${resident.firstName} ${resident.lastName}`,
        data: {
          residentId: resident.id,
          rut: resident.rut,
          name: `${resident.firstName} ${resident.lastName}`,
          address: resident.block,
          numberOfHouse: resident.lotNumber,
          checkInTime,
          guardId,
          gateLocation,
        },
      };
    }

    // Check-in de Invitación
    if (validation.type === QRType.INVITATION) {
      const invitation = await this.invitationRepository.findOne({
        where: { id: validation.data.invitationId },
        relations: ['resident', 'visitor'],
      });

      if (!invitation) {
        throw new NotFoundException('Invitación no encontrada');
      }

      // Marcar invitación como usada
      invitation.status = InvitationStatus.USED;
      invitation.checkInTime = checkInTime;
      await this.invitationRepository.save(invitation);

      // Actualizar visitor si existe
      if (invitation.visitor) {
        invitation.visitor.status = VisitorStatus.IN_PROPERTY;
        invitation.visitor.checkInTime = checkInTime;
        await this.visitorRepository.save(invitation.visitor);

        // Registrar log de visitor
        await this.logService.log(
          LogType.VISITOR,
          LogAction.CHECK_IN,
          `Visitante ${invitation.visitorName} ingresó a la comunidad`,
          {
            userId: invitation.resident.id,
            entityType: 'visitor',
            entityId: invitation.visitor.id,
            details: {
              visitorRut: invitation.visitorRut,
              invitationId: invitation.id,
              residentaddress: invitation.resident.block,
              residentLot: invitation.resident.lotNumber,
              guardId,
              gateLocation,
              ...additionalData,
            },
            severity: 'info',
          },
        );
      }

      // Registrar log de acceso
      await this.logService.log(
        LogType.ACCESS,
        LogAction.CHECK_IN,
        `Invitación usada: ${invitation.visitorName} ingresó mediante QR`,
        {
          userId: invitation.resident.id,
          entityType: 'invitation',
          entityId: invitation.id,
          details: {
            visitorRut: invitation.visitorRut,
            guardId,
            gateLocation,
            ...additionalData,
          },
          severity: 'info',
        },
      );

      return {
        success: true,
        type: QRType.INVITATION,
        message: `Check-in exitoso: ${invitation.visitorName}`,
        data: {
          invitationId: invitation.id,
          visitorName: invitation.visitorName,
          visitorRut: invitation.visitorRut,
          visitingResident: `${invitation.resident.firstName} ${invitation.resident.lastName}`,
          address: invitation.resident.block,
          numberOfHouse: invitation.resident.lotNumber,
          checkInTime,
          guardId,
          gateLocation,
        },
      };
    }

    throw new BadRequestException('Tipo de QR no soportado');
  }

  /**
   * Check-out: Registrar salida mediante QR
   */
  async checkOut(
    qrCode: string,
    guardId?: string,
    gateLocation?: string,
    additionalData?: Record<string, any>,
  ): Promise<{
    success: boolean;
    type: QRType;
    message: string;
    data: any;
  }> {
    // Validar QR primero
    const validation = await this.validateQR(qrCode);

    // Para check-out, permitimos QR inválidos si ya fueron usados
    const checkOutTime = new Date();

    let decoded: any;
    try {
      decoded = JSON.parse(Buffer.from(qrCode, 'base64').toString('utf-8'));
    } catch (error) {
      throw new BadRequestException('Código QR inválido');
    }

    // Check-out de Residente
    if (decoded.type === QRType.RESIDENT) {
      const resident = await this.residentRepository.findOne({
        where: { rut: decoded.rut },
      });

      if (!resident) {
        throw new NotFoundException('Residente no encontrado');
      }

      // Registrar log
      await this.logService.log(
        LogType.ACCESS,
        LogAction.CHECK_OUT,
        `Residente ${resident.firstName} ${resident.lastName} salió de la comunidad`,
        {
          userId: resident.id,
          entityType: 'resident',
          entityId: resident.id,
          details: {
            rut: resident.rut,
            address: resident.block,
            numberOfHouse: resident.lotNumber,
            guardId,
            gateLocation,
            ...additionalData,
          },
          severity: 'info',
        },
      );

      return {
        success: true,
        type: QRType.RESIDENT,
        message: `Check-out exitoso: ${resident.firstName} ${resident.lastName}`,
        data: {
          residentId: resident.id,
          rut: resident.rut,
          name: `${resident.firstName} ${resident.lastName}`,
          address: resident.block,
          numberOfHouse: resident.lotNumber,
          checkOutTime,
          guardId,
          gateLocation,
        },
      };
    }

    // Check-out de Invitación
    if (decoded.type === QRType.INVITATION) {
      const invitation = await this.invitationRepository.findOne({
        where: { id: decoded.invitationId },
        relations: ['resident', 'visitor'],
      });

      if (!invitation) {
        throw new NotFoundException('Invitación no encontrada');
      }

      // Actualizar check-out time
      invitation.checkOutTime = checkOutTime;
      await this.invitationRepository.save(invitation);

      // Actualizar visitor si existe
      if (invitation.visitor) {
        invitation.visitor.status = VisitorStatus.COMPLETED;
        invitation.visitor.checkOutTime = checkOutTime;
        await this.visitorRepository.save(invitation.visitor);

        // Registrar log de visitor
        await this.logService.log(
          LogType.VISITOR,
          LogAction.CHECK_OUT,
          `Visitante ${invitation.visitorName} salió de la comunidad`,
          {
            userId: invitation.resident.id,
            entityType: 'visitor',
            entityId: invitation.visitor.id,
            details: {
              visitorRut: invitation.visitorRut,
              invitationId: invitation.id,
              residentaddress: invitation.resident.block,
              residentLot: invitation.resident.lotNumber,
              guardId,
              gateLocation,
              duration: invitation.checkInTime
                ? Math.floor(
                    (checkOutTime.getTime() -
                      invitation.checkInTime.getTime()) /
                      1000 / 60,
                  ) + ' minutos'
                : 'N/A',
              ...additionalData,
            },
            severity: 'info',
          },
        );
      }

      // Registrar log de acceso
      await this.logService.log(
        LogType.ACCESS,
        LogAction.CHECK_OUT,
        `Visitante ${invitation.visitorName} salió de la comunidad`,
        {
          userId: invitation.resident.id,
          entityType: 'invitation',
          entityId: invitation.id,
          details: {
            visitorRut: invitation.visitorRut,
            guardId,
            gateLocation,
            ...additionalData,
          },
          severity: 'info',
        },
      );

      return {
        success: true,
        type: QRType.INVITATION,
        message: `Check-out exitoso: ${invitation.visitorName}`,
        data: {
          invitationId: invitation.id,
          visitorName: invitation.visitorName,
          visitorRut: invitation.visitorRut,
          visitingResident: `${invitation.resident.firstName} ${invitation.resident.lastName}`,
          address: invitation.resident.block,
          numberOfHouse: invitation.resident.lotNumber,
          checkInTime: invitation.checkInTime,
          checkOutTime,
          duration: invitation.checkInTime
            ? Math.floor(
                (checkOutTime.getTime() - invitation.checkInTime.getTime()) /
                  1000 /
                  60,
              ) + ' minutos'
            : 'N/A',
          guardId,
          gateLocation,
        },
      };
    }

    throw new BadRequestException('Tipo de QR no soportado');
  }
}
