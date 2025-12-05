import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Vehicle, VehicleType } from '../entities/vehicle.entity';
import { Resident } from '../entities/resident.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Resident)
    private residentRepository: Repository<Resident>,
  ) {}

  async createVehicle(residentId: string, createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    // Verificar patente duplicada
    const plateUpper = createVehicleDto.licensePlate.toUpperCase();
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { licensePlate: plateUpper },
    });

    if (existingVehicle) {
      throw new ConflictException(`Ya existe un vehículo con la patente ${plateUpper}`);
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      licensePlate: plateUpper,
      residentId: resident.id,
    });

    return await this.vehicleRepository.save(vehicle);
  }

  async findAllVehicles(
    page: number = 1,
    limit: number = 50,
    ownerId?: string,
    type?: VehicleType,
    isActive?: boolean,
    search?: string,
  ): Promise<{ data: Vehicle[]; meta: any }> {
    const query = this.vehicleRepository.createQueryBuilder('vehicle');

    if (ownerId) {
      query.andWhere('vehicle.residentId = :ownerId', { ownerId });
    }

    if (type) {
      query.andWhere('vehicle.type = :type', { type });
    }

    if (isActive !== undefined) {
      query.andWhere('vehicle.isActive = :isActive', { isActive });
    }

    if (search) {
      query.andWhere(
        '(vehicle.licensePlate ILIKE :search OR vehicle.brand ILIKE :search OR vehicle.model ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('vehicle.createdAt', 'DESC')
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

  async findVehicleById(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con ID ${vehicleId} no encontrado`);
    }
    return vehicle;
  }

  async updateVehicle(vehicleId: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findVehicleById(vehicleId);

    // Si se está actualizando la patente, verificar que no exista
    if (updateVehicleDto.licensePlate) {
      const plateUpper = updateVehicleDto.licensePlate.toUpperCase();
      const existingVehicle = await this.vehicleRepository.findOne({
        where: { licensePlate: plateUpper },
      });

      if (existingVehicle && existingVehicle.id !== vehicleId) {
        throw new ConflictException(`Ya existe un vehículo con la patente ${plateUpper}`);
      }
      updateVehicleDto.licensePlate = plateUpper;
    }

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(vehicleId: string, reason?: string, notes?: string): Promise<Vehicle> {
    const vehicle = await this.findVehicleById(vehicleId);

    vehicle.isActive = false;
    if (reason) {
      vehicle.deleteReason = reason;
    }
    if (notes) {
      vehicle.deleteNotes = notes;
    }

    return await this.vehicleRepository.save(vehicle);
  }

  async searchVehicleByPlate(licensePlate: string): Promise<Vehicle | null> {
    const plateUpper = licensePlate.toUpperCase();
    const vehicle = await this.vehicleRepository.findOne({
      where: { licensePlate: plateUpper },
    });
    return vehicle;
  }

  async checkDuplicatePlate(licensePlate: string, excludeVehicleId?: string): Promise<{
    isDuplicate: boolean;
    existingVehicle?: Vehicle;
  }> {
    const plateUpper = licensePlate.toUpperCase();
    const vehicle = await this.vehicleRepository.findOne({
      where: { licensePlate: plateUpper },
    });

    if (!vehicle) {
      return { isDuplicate: false };
    }

    if (excludeVehicleId && vehicle.id === excludeVehicleId) {
      return { isDuplicate: false };
    }

    return {
      isDuplicate: true,
      existingVehicle: vehicle,
    };
  }

  async getVehicleStats(residentId: string): Promise<any> {
    const resident = await this.residentRepository.findOne({ where: { id: residentId } });
    if (!resident) {
      throw new NotFoundException(`Residente con ID ${residentId} no encontrado`);
    }

    const allVehicles = await this.vehicleRepository.find({
      where: { residentId },
    });

    const byType: Record<string, number> = {};
    const byYear: Record<number, number> = {};
    let activeCount = 0;
    let inactiveCount = 0;

    allVehicles.forEach((vehicle) => {
      // Por tipo
      byType[vehicle.type] = (byType[vehicle.type] || 0) + 1;

      // Por año
      byYear[vehicle.year] = (byYear[vehicle.year] || 0) + 1;

      // Activos/Inactivos
      if (vehicle.isActive) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });

    return {
      success: true,
      data: {
        total: allVehicles.length,
        byType,
        byYear,
        activeCount,
        inactiveCount,
      },
    };
  }

  async activateVehicle(vehicleId: string, notes?: string): Promise<Vehicle> {
    const vehicle = await this.findVehicleById(vehicleId);

    if (vehicle.isActive) {
      throw new BadRequestException('El vehículo ya está activo');
    }

    vehicle.isActive = true;
    vehicle.deleteReason = undefined;
    vehicle.deleteNotes = notes || undefined;

    return await this.vehicleRepository.save(vehicle);
  }
}
