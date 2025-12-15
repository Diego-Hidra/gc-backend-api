import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike} from 'typeorm';
import { Resident } from "src/entities/resident.entity";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import * as bcrypt from 'bcrypt';
import { UpdateResidentDTO } from "src/dto/update-resident.dto";

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
            firstName: dto.name,
            lastName: dto.lastname,
            email: dto.email,
            phone: dto.phone_number,
            password: hashedPassword, 
            floor: dto.floor,
            apartment: dto.apartament,
            block: dto.block || 'A',
            lotNumber: dto.lotNumber || '000'
        });

        return this.residentRepository.save(newResident);
    }

    async findAllResidents(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    floor: string = '',
    apartament: string = '',
  ) {
    const skip = (page - 1) * limit;

    // --- CORRECCIÓN DE FILTROS ---

    // 1. Definimos los filtros base (Filtros estrictos AND)
    const baseFilters: any = {};

    if (floor) {
      baseFilters.floor = floor;
    }

    if (apartament) {
      baseFilters.apartament = apartament;
    }

    // 2. Construimos la condición final
    let whereCondition: any;

    if (search) {
      // Si hay búsqueda, aplicamos (Nombre O Rut) Y (Filtros Base)
      // TypeORM requiere repetir los filtros base en cada objeto del array OR
      const searchCondition = ILike(`%${search}%`);
      whereCondition = [
        { ...baseFilters, name: searchCondition }, // (Filtros) AND Nombre
        { ...baseFilters, rut: searchCondition }, // (Filtros) AND Rut
        { ...baseFilters, lastname: searchCondition }, // Opcional: Buscar por apellido también
      ];
    } else {
      // Si no hay búsqueda, solo usamos los filtros base
      whereCondition = baseFilters;
    }

    const [data, total] = await this.residentRepository.findAndCount({
      select: [
        'id',
        'rut',
        'firstName',
        'lastName',
        'phone',
        'floor',
        'apartment',
        'profilePicture',
      ],
      where: whereCondition,
      take: limit,
      skip: skip,
      order: { id: 'DESC' },
    });

    return {
      data: data,
      meta: {
        total: total,
        page: page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

    async findResidentsByID(id: string): Promise<Resident> {

        const resident = await this.residentRepository.findOne({
            where: {id},

            select: ['id', 'rut', 'firstName', 'lastName', 'phone', 'floor', 'apartment', 'block', 'lotNumber'],
        });

        if (!resident){

            throw new NotFoundException(`Residente con ID "${id}" no encontrado`)
        }

        return resident;
    }
    
    async updateResident(id: string, updateDto: UpdateResidentDTO): Promise<Resident> {

       let passwordHash: string | undefined;

    if (updateDto.password) {
        const salt = await bcrypt.genSalt();
        passwordHash = await bcrypt.hash(updateDto.password, salt);
    }
    
    // Mapear campos del DTO a los nombres de la entidad
    const updateData: any = {};
    if (updateDto.name) updateData.firstName = updateDto.name;
    if (updateDto.lastname) updateData.lastName = updateDto.lastname;
    if (updateDto.phone_number) updateData.phone = updateDto.phone_number;
    if (updateDto.floor) updateData.floor = updateDto.floor;
    if (updateDto.apartament) updateData.apartment = updateDto.apartament;
    if (updateDto.block) updateData.block = updateDto.block;
    if (updateDto.lotNumber) updateData.lotNumber = updateDto.lotNumber;
    if (updateDto.email) updateData.email = updateDto.email;
    if (updateDto.rut) updateData.rut = updateDto.rut;
    if (passwordHash) updateData.password = passwordHash;
    
    const updateResult = await this.residentRepository.update(id, updateData);

    if (updateResult.affected === 0) {
        throw new NotFoundException(`Residente con ID "${id}" no encontrado.`);
    }

  
    const updatedResident = await this.residentRepository.findOne({ 
        where: { id } 
    });


    if (!updatedResident) {
        throw new NotFoundException(`Error interno al recuperar el residente ID "${id}".`);
    }

    return updatedResident; 
    
    }

    /**
     * Desactiva un residente (soft delete)
     * @param id ID del residente a desactivar
     * @returns Residente desactivado
     */
    async deactivateResident(id: string): Promise<Resident> {
        const resident = await this.residentRepository.findOne({ where: { id } });

        if (!resident) {
            throw new NotFoundException(`Residente con ID "${id}" no encontrado.`);
        }

        if (!resident.isActive) {
            throw new BadRequestException(`El residente ya está desactivado.`);
        }

        resident.isActive = false;
        return await this.residentRepository.save(resident);
    }

    /**
     * Reactiva un residente desactivado
     * @param id ID del residente a reactivar
     * @returns Residente reactivado
     */
    async activateResident(id: string): Promise<Resident> {
        const resident = await this.residentRepository.findOne({ where: { id } });

        if (!resident) {
            throw new NotFoundException(`Residente con ID "${id}" no encontrado.`);
        }

        if (resident.isActive) {
            throw new BadRequestException(`El residente ya está activo.`);
        }

        resident.isActive = true;
        return await this.residentRepository.save(resident);
    }

}