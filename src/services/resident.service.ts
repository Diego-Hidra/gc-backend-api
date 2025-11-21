import { Injectable, ConflictException, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from "src/entities/resident.entity";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import { UpdateResidentDTO } from "src/dto/update-resident.dto";
import { ChangePasswordDTO } from "src/dto/change-password.dto";
import { FrequentVisitorService } from "./frequent-visitor.service";
import { VisitorService } from "./visitor.service";
import { InvitationService } from "./invitation.service";
import { VehicleService } from "./vehicle.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResidentService {

    constructor(
        @InjectRepository(Resident)
        private readonly residentRepository: Repository<Resident>,
        @Inject(forwardRef(() => FrequentVisitorService))
        private readonly frequentVisitorService: FrequentVisitorService,
        @Inject(forwardRef(() => VisitorService))
        private readonly visitorService: VisitorService,
        @Inject(forwardRef(() => InvitationService))
        private readonly invitationService: InvitationService,
        @Inject(forwardRef(() => VehicleService))
        private readonly vehicleService: VehicleService,
    ) {}

    async createResident(dto: CreateResidentDTO): Promise<Resident> {
        
        const existingResident = await this.residentRepository.findOne({ 
            where: [{ rut: dto.rut }, { email: dto.email }] 
        });

        if (existingResident) {
            throw new ConflictException('Ya existe un residente con este RUT o Email.');
        }
        
        const salt = await bcrypt.genSalt();
    
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const newResident = this.residentRepository.create({
            rut: dto.rut,
            firstName: dto.name,
            lastName: dto.lastname,
            email: dto.email,
            phone: dto.phone_number,
            password: hashedPassword, 
            block: dto.floor,
            lotNumber: dto.apartament
        });

        return this.residentRepository.save(newResident);
    }

    async findAllResidents(): Promise<Resident[]> {
        return this.residentRepository.find({
            where: { isActive: true },
            select: ['id', 'rut', 'firstName', 'lastName', 'email', 'phone', 'block', 'lotNumber'],
        });
    }

    async findResidentsByID(id: string): Promise<Resident> {
        const resident = await this.residentRepository.findOne({
            where: { id, isActive: true },
            select: ['id', 'rut', 'firstName', 'lastName', 'email', 'phone', 'block', 'lotNumber'],
        });

        if (!resident) {
            throw new NotFoundException(`Residente con ID "${id}" no encontrado`);
        }

        return resident;
    }

    async updateResident(id: string, dto: UpdateResidentDTO): Promise<Resident> {
        const resident = await this.findResidentsByID(id);

        Object.assign(resident, dto);

        return this.residentRepository.save(resident);
    }

    async deleteResident(id: string): Promise<{ message: string }> {
        const resident = await this.findResidentsByID(id);
        
        resident.isActive = false;
        await this.residentRepository.save(resident);

        return { message: 'Residente eliminado correctamente' };
    }

    async searchResident(rut?: string, email?: string): Promise<Resident> {
        if (!rut && !email) {
            throw new BadRequestException('Debe proporcionar RUT o Email para buscar');
        }

        let resident: Resident | null = null;

        if (rut) {
            resident = await this.residentRepository.findOne({
                where: { rut, isActive: true }
            });
        }
        
        if (!resident && email) {
            resident = await this.residentRepository.findOne({
                where: { email, isActive: true }
            });
        }

        if (!resident) {
            throw new NotFoundException('Residente no encontrado');
        }

        return resident;
    }

    async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
        const resident = await this.residentRepository.findOne({
            where: { email }
        });

        return { available: !resident };
    }

    async checkRutAvailability(rut: string): Promise<{ available: boolean }> {
        const resident = await this.residentRepository.findOne({
            where: { rut }
        });

        return { available: !resident };
    }

    async changePassword(id: string, dto: ChangePasswordDTO): Promise<{ message: string }> {
        const resident = await this.residentRepository.findOne({
            where: { id, isActive: true }
        });

        if (!resident) {
            throw new NotFoundException('Residente no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(dto.currentPassword, resident.password);
        if (!isPasswordValid) {
            throw new BadRequestException('La contraseña actual es incorrecta');
        }

        const salt = await bcrypt.genSalt();
        resident.password = await bcrypt.hash(dto.newPassword, salt);

        await this.residentRepository.save(resident);

        return { message: 'Contraseña actualizada correctamente' };
    }

    async getResidentStats(id: string): Promise<any> {
        const resident = await this.findResidentsByID(id);

        // Por ahora retornamos stats básicas
        // Cuando implementes los otros módulos, agregarás las relaciones
        return {
            id: resident.id,
            name: `${resident.firstName} ${resident.lastName}`,
            totalVisitors: 0,
            totalInvitations: 0,
            totalVehicles: 0,
            createdAt: resident.createdAt
        };
    }

    async getResidentVisitors(id: string): Promise<any> {
        await this.findResidentsByID(id);
        return this.visitorService.findVisitorsByResident(id);
    }

    async createVisitorForResident(id: string, createVisitorDto: any): Promise<any> {
        await this.findResidentsByID(id);
        return this.visitorService.createVisitor(id, createVisitorDto);
    }

    async getResidentInvitations(id: string): Promise<any> {
        await this.findResidentsByID(id);
        return this.invitationService.findInvitationsByResident(id);
    }

    async getResidentVehicles(id: string): Promise<any> {
        await this.findResidentsByID(id);
        return this.vehicleService.findAllVehicles(1, 100, id);
    }

    async getResidentFrequentVisitors(id: string): Promise<any[]> {
        await this.findResidentsByID(id);
        return this.frequentVisitorService.findFrequentVisitorsByResident(id);
    }

    async createFrequentVisitor(id: string, createDto: any): Promise<any> {
        await this.findResidentsByID(id);
        return this.frequentVisitorService.createFrequentVisitor(id, createDto);
    }

    async createInvitation(id: string, createDto: any): Promise<any> {
        await this.findResidentsByID(id);
        return this.invitationService.createInvitation(id, createDto);
    }
}