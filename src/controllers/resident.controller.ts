import { Controller, Post, Body, UsePipes, ValidationPipe, HttpStatus, HttpCode, Get, Param, Query, Patch, Delete } from "@nestjs/common";
import { ResidentService } from "src/services/resident.service";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import { UpdateResidentDTO } from "src/dto/update-resident.dto";
import { ChangePasswordDTO } from "src/dto/change-password.dto";
import { Resident } from "src/entities/resident.entity";

@Controller('api/resident')
export class ResidentController {
    constructor(
        private readonly residentService: ResidentService,
    ) {}

    // 02.1 Crear Residente
    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    async addResident(@Body() createResidentDTO: CreateResidentDTO): Promise<Resident> {
        return this.residentService.createResident(createResidentDTO);
    }

    // 02.2 Listar Residentes
    @Get('all')
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Resident[]> {
        return this.residentService.findAllResidents();
    }

    // 02.6 y 02.7 Buscar Residente por RUT o Email
    @Get('search')
    @HttpCode(HttpStatus.OK)
    async searchResident(@Query('rut') rut?: string, @Query('email') email?: string): Promise<Resident> {
        return this.residentService.searchResident(rut, email);
    }

    // 02.12 Verificar Disponibilidad de Email
    @Get('check-email')
    @HttpCode(HttpStatus.OK)
    async checkEmailAvailability(@Query('email') email: string): Promise<{ available: boolean }> {
        return this.residentService.checkEmailAvailability(email);
    }

    // 02.13 Verificar Disponibilidad de RUT
    @Get('check-rut')
    @HttpCode(HttpStatus.OK)
    async checkRutAvailability(@Query('rut') rut: string): Promise<{ available: boolean }> {
        return this.residentService.checkRutAvailability(rut);
    }

    // 02.3 Obtener Residente por ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findByID(@Param('id') id: string): Promise<Resident> {
        return this.residentService.findResidentsByID(id);
    }

    // 02.4 Actualizar Residente
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    async updateResident(@Param('id') id: string, @Body() updateResidentDTO: UpdateResidentDTO): Promise<Resident> {
        return this.residentService.updateResident(id, updateResidentDTO);
    }

    // 02.5 Eliminar Residente
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteResident(@Param('id') id: string): Promise<{ message: string }> {
        return this.residentService.deleteResident(id);
    }

    // 02.8 Obtener Visitantes del Residente
    @Get(':id/visitors')
    @HttpCode(HttpStatus.OK)
    async getResidentVisitors(@Param('id') id: string): Promise<any[]> {
        return this.residentService.getResidentVisitors(id);
    }

    // Crear Visitante para Residente
    @Post(':id/visitors/add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createVisitorForResident(@Param('id') id: string, @Body() createVisitorDto: any): Promise<any> {
        return this.residentService.createVisitorForResident(id, createVisitorDto);
    }

    // 02.9 Obtener Invitaciones del Residente
    @Get(':id/invitations')
    @HttpCode(HttpStatus.OK)
    async getResidentInvitations(@Param('id') id: string): Promise<any[]> {
        return this.residentService.getResidentInvitations(id);
    }

    // Crear Invitación para Residente
    @Post(':id/invitations/add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createInvitationForResident(@Param('id') id: string, @Body() createInvitationDto: any): Promise<any> {
        return this.residentService.createInvitation(id, createInvitationDto);
    }

    // 02.10 Obtener Vehículos del Residente
    @Get(':id/vehicles')
    @HttpCode(HttpStatus.OK)
    async getResidentVehicles(@Param('id') id: string): Promise<any[]> {
        return this.residentService.getResidentVehicles(id);
    }

    // 02.11 Cambiar Contraseña
    @Patch(':id/change-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    async changePassword(@Param('id') id: string, @Body() changePasswordDTO: ChangePasswordDTO): Promise<{ message: string }> {
        return this.residentService.changePassword(id, changePasswordDTO);
    }

    // 02.14 Obtener Estadísticas del Residente
    @Get(':id/stats')
    @HttpCode(HttpStatus.OK)
    async getResidentStats(@Param('id') id: string): Promise<any> {
        return this.residentService.getResidentStats(id);
    }

    // 05.2 Listar Visitantes Frecuentes del Residente
    @Get(':id/frequent-visitors')
    @HttpCode(HttpStatus.OK)
    async getFrequentVisitors(@Param('id') id: string): Promise<any[]> {
        return this.residentService.getResidentFrequentVisitors(id);
    }

    // 05.1 Crear Visitante Frecuente
    @Post(':id/frequent-visitors')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createFrequentVisitor(@Param('id') id: string, @Body() createDto: any): Promise<any> {
        return this.residentService.createFrequentVisitor(id, createDto);
    }

    // 04.1 Crear Invitación
    @Post(':id/invitations')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createInvitation(@Param('id') id: string, @Body() createDto: any): Promise<any> {
        return this.residentService.createInvitation(id, createDto);
    }
}
