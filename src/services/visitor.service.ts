import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Visitor, VisitorStatus } from '../entities/visitor.entity';
import { Resident } from '../entities/resident.entity';
import { CreateVisitorDto } from '../dto/create-visitor.dto';
import { UpdateVisitorStatusDto } from '../dto/update-visitor-status.dto';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
    @InjectRepository(Resident)
    private residentRepository: Repository<Resident>,
  ) {}

  async findAll(): Promise<Visitor[]> {
    return await this.visitorRepository.find({
      order: { scheduledDate: 'DESC' },
    });
  }

  async createVisitor(idResident: string, createVisitorDto: CreateVisitorDto): Promise<Visitor> {
    const resident = await this.residentRepository.findOne({ where: { id: idResident } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${idResident} no encontrado`);
    }

    const visitor = this.visitorRepository.create({
      ...createVisitorDto,
      residentId: resident.id,
      scheduledDate: new Date(createVisitorDto.scheduledDate),
      status: createVisitorDto.autoApprove ? VisitorStatus.APPROVED : VisitorStatus.PENDING,
    });

    return await this.visitorRepository.save(visitor);
  }

  async findVisitorsByResident(
    residentId: string,
    page: number = 1,
    limit: number = 20,
    status?: VisitorStatus,
    startDate?: string,
    endDate?: string,
    search?: string,
  ): Promise<{ data: Visitor[]; meta: any }> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    const query = this.visitorRepository
      .createQueryBuilder('visitor')
      .where('visitor.residentId = :residentId', { residentId });

    if (status) {
      query.andWhere('visitor.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('visitor.scheduledDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (search) {
      query.andWhere(
        '(visitor.firstName ILIKE :search OR visitor.lastName ILIKE :search OR visitor.rut ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('visitor.scheduledDate', 'DESC')
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

  async updateVisitorStatus(visitorId: string, updateStatusDto: UpdateVisitorStatusDto): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { id: visitorId } });
    if (!visitor) {
      throw new NotFoundException(`Visitante con ID ${visitorId} no encontrado`);
    }

    visitor.status = updateStatusDto.status;

    // Auto-actualizar checkInTime o checkOutTime según el estado
    if (updateStatusDto.status === VisitorStatus.IN_PROPERTY && !visitor.checkInTime) {
      visitor.checkInTime = new Date();
    }

    if (updateStatusDto.status === VisitorStatus.COMPLETED || updateStatusDto.status === VisitorStatus.REJECTED) {
      if (!visitor.checkOutTime) {
        visitor.checkOutTime = new Date();
      }
    }

    return await this.visitorRepository.save(visitor);
  }

  async getVisitorById(visitorId: string): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { id: visitorId } });
    if (!visitor) {
      throw new NotFoundException(`Visitante con ID ${visitorId} no encontrado`);
    }
    return visitor;
  }
}
