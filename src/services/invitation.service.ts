import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from '../entities/invitation.entity';
import { Resident } from '../entities/resident.entity';
import { Visitor } from '../entities/visitor.entity';
import { FrequentVisitor } from '../entities/frequent-visitor.entity';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { UpdateInvitationStatusDto } from '../dto/update-invitation-status.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Resident)
    private residentRepository: Repository<Resident>,
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
    @InjectRepository(FrequentVisitor)
    private frequentVisitorRepository: Repository<FrequentVisitor>,
  ) {}

  async findAll(): Promise<Invitation[]> {
    return await this.invitationRepository.find({
      relations: ['resident', 'visitor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
      relations: ['resident', 'visitor'],
    });

    if (!invitation) {
      throw new NotFoundException(`Invitación con ID ${id} no encontrada`);
    }

    return invitation;
  }

  async createInvitation(residentId: string, createInvitationDto: CreateInvitationDto): Promise<Invitation> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    let visitorData = {
      visitorName: createInvitationDto.visitorName,
      visitorRut: createInvitationDto.visitorRut,
      visitorPhone: createInvitationDto.visitorPhone,
      visitorEmail: createInvitationDto.visitorEmail,
      hasVehicle: createInvitationDto.hasVehicle || false,
      vehicleInfo: createInvitationDto.vehicleInfo,
    };

    // Si se proporciona frequentVisitorId, autocompletar datos desde el visitante frecuente
    if (createInvitationDto.frequentVisitorId) {
      const frequentVisitor = await this.frequentVisitorRepository.findOne({ 
        where: { id: createInvitationDto.frequentVisitorId } 
      });
      
      if (!frequentVisitor) {
        throw new NotFoundException(`Visitante frecuente con ID ${createInvitationDto.frequentVisitorId} no encontrado`);
      }

      // Autocompletar con datos del visitante frecuente (se pueden sobrescribir con los del DTO)
      visitorData = {
        visitorName: createInvitationDto.visitorName || frequentVisitor.name,
        visitorRut: createInvitationDto.visitorRut || frequentVisitor.rut,
        visitorPhone: createInvitationDto.visitorPhone || frequentVisitor.phone,
        visitorEmail: createInvitationDto.visitorEmail || frequentVisitor.email,
        hasVehicle: createInvitationDto.hasVehicle ?? (frequentVisitor.vehicleInfo ? true : false),
        vehicleInfo: createInvitationDto.vehicleInfo || frequentVisitor.vehicleInfo,
      };
    }

    // Validar que al menos tengamos los datos mínimos
    if (!visitorData.visitorName || !visitorData.visitorRut || !visitorData.visitorPhone) {
      throw new BadRequestException('Debe proporcionar visitorName, visitorRut y visitorPhone, o un frequentVisitorId válido');
    }

    // Si se proporciona visitorId, verificar que el visitante existe
    if (createInvitationDto.visitorId) {
      const visitor = await this.visitorRepository.findOne({ where: { id: createInvitationDto.visitorId } });
      if (!visitor) {
        throw new NotFoundException(`Visitante con ID ${createInvitationDto.visitorId} no encontrado`);
      }
    }

    const invitationData: any = {
      ...visitorData,
      scheduledDate: new Date(createInvitationDto.scheduledDate),
      expirationDate: createInvitationDto.expirationDate ? new Date(createInvitationDto.expirationDate) : new Date(createInvitationDto.scheduledDate),
      visitPurpose: createInvitationDto.visitPurpose,
      notes: createInvitationDto.notes,
      residentId: resident.id,
      visitorId: createInvitationDto.visitorId || null,
      status: InvitationStatus.PENDING,
    };

    const invitation = this.invitationRepository.create(invitationData);
    const savedInvitation = await this.invitationRepository.save(invitation) as unknown as Invitation;
    return savedInvitation;
  }

  async findInvitationsByResident(
    residentId: string,
    page: number = 1,
    limit: number = 20,
    status?: InvitationStatus,
  ): Promise<{ data: Invitation[]; meta: any }> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    const query = this.invitationRepository
      .createQueryBuilder('invitation')
      .where('invitation.residentId = :residentId', { residentId });

    if (status) {
      query.andWhere('invitation.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('invitation.scheduledDate', 'DESC')
      .getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveInvitation(invitationId: string, notes?: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      throw new NotFoundException(`Invitación con ID ${invitationId} no encontrada`);
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`La invitación ya fue procesada con estado: ${invitation.status}`);
    }

    invitation.status = InvitationStatus.APPROVED;
    invitation.qrCode = this.generateQRCode(invitation);
    if (notes) {
      invitation.notes = notes;
    }

    return await this.invitationRepository.save(invitation);
  }

  async rejectInvitation(invitationId: string, reason?: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      throw new NotFoundException(`Invitación con ID ${invitationId} no encontrada`);
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`La invitación ya fue procesada con estado: ${invitation.status}`);
    }

    invitation.status = InvitationStatus.REJECTED;
    invitation.rejectionReason = reason || '';

    return await this.invitationRepository.save(invitation);
  }

  async cancelInvitation(invitationId: string, reason?: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      throw new NotFoundException(`Invitación con ID ${invitationId} no encontrada`);
    }

    if (![InvitationStatus.PENDING, InvitationStatus.APPROVED].includes(invitation.status)) {
      throw new BadRequestException(`No se puede cancelar una invitación con estado: ${invitation.status}`);
    }

    invitation.status = InvitationStatus.CANCELLED;
    invitation.cancellationReason = reason || '';

    return await this.invitationRepository.save(invitation);
  }

  async updateInvitationStatus(invitationId: string, updateStatusDto: UpdateInvitationStatusDto): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) {
      throw new NotFoundException(`Invitación con ID ${invitationId} no encontrada`);
    }

    if (updateStatusDto.status) {
      invitation.status = updateStatusDto.status;
    }

    if (updateStatusDto.reason) {
      if (updateStatusDto.status === InvitationStatus.REJECTED) {
        invitation.rejectionReason = updateStatusDto.reason;
      } else if (updateStatusDto.status === InvitationStatus.CANCELLED) {
        invitation.cancellationReason = updateStatusDto.reason;
      }
    }

    if (updateStatusDto.notes) {
      invitation.notes = updateStatusDto.notes;
    }

    return await this.invitationRepository.save(invitation);
  }

  async getInvitationStats(residentId: string): Promise<any> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    const allInvitations = await this.invitationRepository.find({
      where: { residentId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayInvitations = allInvitations.filter(
      (inv) => inv.scheduledDate >= today && inv.scheduledDate < tomorrow,
    ).length;

    const upcomingInvitations = allInvitations.filter(
      (inv) => inv.scheduledDate > tomorrow && inv.status === InvitationStatus.APPROVED,
    ).length;

    const byStatus = {
      pending: allInvitations.filter((inv) => inv.status === InvitationStatus.PENDING).length,
      approved: allInvitations.filter((inv) => inv.status === InvitationStatus.APPROVED).length,
      rejected: allInvitations.filter((inv) => inv.status === InvitationStatus.REJECTED).length,
      used: allInvitations.filter((inv) => inv.status === InvitationStatus.USED).length,
      expired: allInvitations.filter((inv) => inv.status === InvitationStatus.EXPIRED).length,
      cancelled: allInvitations.filter((inv) => inv.status === InvitationStatus.CANCELLED).length,
    };

    return {
      success: true,
      data: {
        total: allInvitations.length,
        byStatus,
        todayInvitations,
        upcomingInvitations,
      },
    };
  }

  private generateQRCode(invitation: Invitation): string {
    const data = `INV-${invitation.id}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }
}
