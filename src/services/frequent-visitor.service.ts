import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrequentVisitor } from '../entities/frequent-visitor.entity';
import { Resident } from '../entities/resident.entity';
import { Invitation, InvitationStatus } from '../entities/invitation.entity';
import { CreateFrequentVisitorDto } from '../dto/create-frequent-visitor.dto';
import { CreateInvitationFromFrequentDto } from '../dto/create-invitation-from-frequent.dto';

@Injectable()
export class FrequentVisitorService {
  constructor(
    @InjectRepository(FrequentVisitor)
    private frequentVisitorRepository: Repository<FrequentVisitor>,
    @InjectRepository(Resident)
    private residentRepository: Repository<Resident>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}

  async findFrequentVisitorsByResident(residentId: string): Promise<FrequentVisitor[]> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    return await this.frequentVisitorRepository.find({
      where: { residentId, isActive: true },
      order: { lastVisit: 'DESC' },
    });
  }

  async createFrequentVisitor(residentId: string, createDto: CreateFrequentVisitorDto): Promise<FrequentVisitor> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    // Verificar si ya existe un visitante frecuente con el mismo RUT
    const existing = await this.frequentVisitorRepository.findOne({
      where: { residentId, rut: createDto.rut, isActive: true },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe un visitante frecuente con RUT ${createDto.rut}`);
    }

    const frequentVisitor = this.frequentVisitorRepository.create({
      ...createDto,
      residentId,
    });

    return await this.frequentVisitorRepository.save(frequentVisitor);
  }

  async createInvitationFromFrequent(
    frequentVisitorId: string,
    createDto: CreateInvitationFromFrequentDto,
  ): Promise<{ frequentVisitor: FrequentVisitor; invitation: Invitation }> {
    const frequentVisitor = await this.frequentVisitorRepository.findOne({
      where: { id: frequentVisitorId, isActive: true },
    });

    if (!frequentVisitor) {
      throw new NotFoundException(`Visitante frecuente con ID ${frequentVisitorId} no encontrado`);
    }

    // Crear invitación usando datos del visitante frecuente
    const scheduledDate = new Date(createDto.scheduledDate);
    const expirationDate = new Date(scheduledDate);
    expirationDate.setDate(expirationDate.getDate() + 1); // Expira al día siguiente

    const invitation = this.invitationRepository.create({
      visitorName: frequentVisitor.name,
      visitorRut: frequentVisitor.rut,
      visitorPhone: frequentVisitor.phone,
      visitorEmail: frequentVisitor.email,
      scheduledDate,
      expirationDate,
      visitPurpose: createDto.visitPurpose,
      notes: createDto.notes,
      hasVehicle: !!frequentVisitor.vehicleInfo,
      vehicleInfo: frequentVisitor.vehicleInfo,
      residentId: frequentVisitor.residentId,
      status: InvitationStatus.APPROVED,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Actualizar contador de visitas
    frequentVisitor.visitCount += 1;
    frequentVisitor.lastVisit = new Date();
    await this.frequentVisitorRepository.save(frequentVisitor);

    return {
      frequentVisitor,
      invitation: savedInvitation,
    };
  }

  async deleteFrequentVisitor(frequentVisitorId: string): Promise<FrequentVisitor> {
    const frequentVisitor = await this.frequentVisitorRepository.findOne({
      where: { id: frequentVisitorId },
    });

    if (!frequentVisitor) {
      throw new NotFoundException(`Visitante frecuente con ID ${frequentVisitorId} no encontrado`);
    }

    // Soft delete
    frequentVisitor.isActive = false;
    return await this.frequentVisitorRepository.save(frequentVisitor);
  }
}
