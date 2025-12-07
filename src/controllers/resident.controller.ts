import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, HttpStatus, HttpCode, Get, Param, Patch, Query } from "@nestjs/common";
import { ResidentService } from "src/services/resident.service";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import { Resident } from "src/entities/resident.entity";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UpdateResidentDTO } from "src/dto/update-resident.dto";

@Controller('api/resident')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResidentController {
    constructor(private readonly residentService: ResidentService) {}

    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    @Roles('ADMIN')
    async addResident (
        @Body() createResidentDTO: CreateResidentDTO,
    ): Promise<Resident> {

        return this.residentService.createResident(createResidentDTO)
    }

  @Get('all') 
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('floor') floor: string = '',
    @Query('apartament') apartament: string = '',
  ) {
    
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    return this.residentService.findAllResidents(
      pageNumber,
      limitNumber,
      search,
      floor,
      apartament,
    );
  }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async findByID(@Param('id') id: string): Promise<Resident> {
        
        return this.residentService.findResidentsByID(id);
    }

    @Patch(':id/update')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async updateResident(@Param('id') id: string, @Body() updateDto: UpdateResidentDTO) {
        return this.residentService.updateResident(id, updateDto);
    }

    @Patch(':id/profile')
    @HttpCode(HttpStatus.OK)
    async updateOwnProfile(@Param('id') id: string, @Body() updateDto: UpdateResidentDTO) {
        // Permitir que cualquier usuario autenticado actualice su propio perfil
        // TODO: Verificar que el ID del token coincida con el ID del parámetro para mayor seguridad
        const data = await this.residentService.updateResident(id, updateDto);
        return { success: true, data };
    }


}