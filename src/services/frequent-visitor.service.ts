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

  async findFrequentVisitorsByResident(residentId: string): Promise<any[]> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    const visitors = await this.frequentVisitorRepository.find({
      where: { residentId, isActive: true },
      order: { lastVisit: 'DESC' },
    });

    // Mapear al formato esperado por el frontend
    return visitors.map(visitor => ({
      id: visitor.id,
      resident_id: visitor.residentId,
      visitor_name: `${visitor.firstName} ${visitor.lastName}`,
      visitor_dni: visitor.rut,
      visitor_phone: visitor.phone,
      visitor_email: visitor.email,
      notes: visitor.notes,
      vehicle_info: visitor.vehicleInfo,
      visit_count: visitor.visitCount,
      last_visit: visitor.lastVisit,
      created_at: visitor.createdAt,
      updated_at: visitor.updatedAt,
    }));
  }

  async createFrequentVisitor(residentId: string, createDto: CreateFrequentVisitorDto): Promise<any> {
    console.log('🔍 Creando visitante frecuente...');
    console.log('📝 DTO recibido:', JSON.stringify(createDto, null, 2));
    
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    // Verificar si ya existe un visitante frecuente con el mismo RUT
    const existing = await this.frequentVisitorRepository.findOne({
      where: { residentId, rut: createDto.visitor_dni, isActive: true },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe un visitante frecuente con RUT ${createDto.visitor_dni}`);
    }

    // Mapear campos del DTO a la entidad
    // visitor_name viene como "Nombre Apellido" del frontend
    const nameParts = createDto.visitor_name.split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || '';
    
    const frequentVisitor = new FrequentVisitor();
    frequentVisitor.firstName = firstName;
    frequentVisitor.lastName = lastName;
    frequentVisitor.rut = createDto.visitor_dni;
    frequentVisitor.phone = createDto.visitor_phone;
    frequentVisitor.email = createDto.visitor_email;
    frequentVisitor.notes = createDto.notes;
    frequentVisitor.hasVehicle = !!createDto.vehicleInfo;
    frequentVisitor.vehicleInfo = createDto.vehicleInfo;
    frequentVisitor.residentId = residentId;

    console.log('💾 Entidad a guardar:', JSON.stringify(frequentVisitor, null, 2));
    console.log('🔍 Tipo de datos:');
    console.log('  - firstName:', typeof frequentVisitor.firstName, frequentVisitor.firstName);
    console.log('  - lastName:', typeof frequentVisitor.lastName, frequentVisitor.lastName);
    console.log('  - rut:', typeof frequentVisitor.rut, frequentVisitor.rut);
    console.log('  - phone:', typeof frequentVisitor.phone, frequentVisitor.phone);
    console.log('  - email:', typeof frequentVisitor.email, frequentVisitor.email);
    console.log('  - notes:', typeof frequentVisitor.notes, frequentVisitor.notes);
    console.log('  - hasVehicle:', typeof frequentVisitor.hasVehicle, frequentVisitor.hasVehicle);
    console.log('  - vehicleInfo:', typeof frequentVisitor.vehicleInfo, JSON.stringify(frequentVisitor.vehicleInfo));
    console.log('  - residentId:', typeof frequentVisitor.residentId, frequentVisitor.residentId);

    try {
      const saved = await this.frequentVisitorRepository.save(frequentVisitor);
      console.log('✅ Visitante frecuente guardado:', saved.id);
      
      return {
        id: saved.id,
        resident_id: saved.residentId,
        visitor_name: `${saved.firstName} ${saved.lastName}`,
        visitor_dni: saved.rut,
        visitor_phone: saved.phone,
        visitor_email: saved.email,
        notes: saved.notes,
        vehicle_info: saved.vehicleInfo,
        visit_count: saved.visitCount,
        last_visit: saved.lastVisit,
        created_at: saved.createdAt,
        updated_at: saved.updatedAt,
      };
    } catch (error) {
      console.error('❌ Error al guardar visitante frecuente:', error);
      throw new BadRequestException(`Error al guardar: ${error.message}`);
    }
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
      firstName: frequentVisitor.firstName,
      lastName: frequentVisitor.lastName,
      rut: frequentVisitor.rut,
      phone: frequentVisitor.phone,
      email: frequentVisitor.email,
      scheduledDate,
      expirationDate,
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
