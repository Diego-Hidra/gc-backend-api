import { Controller, Post, Get, Patch, Body, Param, Query, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { DeleteVehicleDto } from '../dto/delete-vehicle.dto';
import { Vehicle, VehicleType } from '../entities/vehicle.entity';

@Controller('api')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post(':id_resident/cars/add')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerVehicle(
    @Param('id_resident') residentId: string,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<{ success: boolean; data: Vehicle }> {
    const data = await this.vehicleService.createVehicle(residentId, createVehicleDto);
    return { success: true, data };
  }

  @Get('cars/all')
  @HttpCode(HttpStatus.OK)
  async getAllVehicles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('ownerId') ownerId?: string,
    @Query('type') type?: VehicleType,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<{ success: boolean; data: Vehicle[]; meta: any }> {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    
    const result = await this.vehicleService.findAllVehicles(
      Number(page),
      Math.min(Number(limit), 200),
      ownerId,
      type,
      isActiveBoolean,
      search,
    );
    return { success: true, ...result };
  }

  @Get('cars/search')
  @HttpCode(HttpStatus.OK)
  async searchVehicleByPlate(
    @Query('licensePlate') licensePlate: string,
  ): Promise<{ success: boolean; data: Vehicle | null }> {
    if (!licensePlate) {
      throw new Error('El parámetro "licensePlate" es requerido');
    }
    const data = await this.vehicleService.searchVehicleByPlate(licensePlate);
    return { success: true, data };
  }

  @Get('cars/check-duplicate')
  @HttpCode(HttpStatus.OK)
  async checkDuplicatePlate(
    @Query('licensePlate') licensePlate: string,
    @Query('excludeId') excludeId?: string,
  ): Promise<{ success: boolean; isDuplicate: boolean; existingVehicle?: Vehicle }> {
    if (!licensePlate) {
      throw new Error('El parámetro "licensePlate" es requerido');
    }
    const result = await this.vehicleService.checkDuplicatePlate(licensePlate, excludeId);
    return { success: true, ...result };
  }

  @Get('cars/:id_car')
  @HttpCode(HttpStatus.OK)
  async getVehicleById(@Param('id_car') vehicleId: string): Promise<{ success: boolean; data: Vehicle }> {
    const data = await this.vehicleService.findVehicleById(vehicleId);
    return { success: true, data };
  }

  @Patch('cars/:id/update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateVehicle(
    @Param('id') vehicleId: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<{ success: boolean; data: Vehicle }> {
    const data = await this.vehicleService.updateVehicle(vehicleId, updateVehicleDto);
    return { success: true, data };
  }

  @Patch('cars/car/:id/delete')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async deleteVehicle(
    @Param('id') vehicleId: string,
    @Body() deleteVehicleDto: DeleteVehicleDto,
  ): Promise<{ success: boolean; data: Vehicle; message: string }> {
    const data = await this.vehicleService.deleteVehicle(
      vehicleId,
      deleteVehicleDto.reason,
      deleteVehicleDto.notes,
    );
    return { 
      success: true, 
      data,
      message: 'Vehículo desactivado exitosamente'
    };
  }

  @Get('residents/:id/vehicles/stats')
  @HttpCode(HttpStatus.OK)
  async getVehicleStats(@Param('id') residentId: string) {
    return this.vehicleService.getVehicleStats(residentId);
  }

  @Patch('cars/:id/activate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async activateVehicle(
    @Param('id') vehicleId: string,
    @Body('notes') notes?: string,
  ): Promise<{ success: boolean; data: Vehicle; message: string }> {
    const data = await this.vehicleService.activateVehicle(vehicleId, notes);
    return { 
      success: true, 
      data,
      message: 'Vehículo reactivado exitosamente'
    };
  }
}
