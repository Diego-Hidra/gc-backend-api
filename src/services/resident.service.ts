import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from "src/entities/resident.entity";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResidentService {

    constructor(
        @InjectRepository(Resident)
        private readonly residentRepository: Repository<Resident>,
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
            name: dto.name,
            lastname: dto.lastname,
            email: dto.email,
            phone_number: dto.phone_number,
            password: hashedPassword, 
            floor: dto.floor,
            apartament: dto.apartament
        });

        return this.residentRepository.save(newResident);
    }

    async findAllResidents(): Promise<Resident[]> {

        return this.residentRepository.find({

            select: ['id', 'rut', 'name', 'lastname', 'email', 'phone_number'],
        });
    }

    async findResidentsByID(id: string): Promise<Resident> {

        const resident = await this.residentRepository.findOne({
            where: {id},

            select: ['id', 'rut', 'name', 'lastname', 'email', 'phone_number'],
        });

        if (!resident){

            throw new NotFoundException(`Residente con ID "${id}" no encontrado`)
        }

        return resident;
    }
}