import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, HttpStatus, HttpCode, Get, Param, Patch, Query } from "@nestjs/common";
import { ResidentService } from "src/services/resident.service";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import { Resident } from "src/entities/resident.entity";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UpdateResidentDTO } from "src/dto/update-resident.dto";
import { UploadImageDto } from "src/dto/upload-image.dto";
import { AzureBlobService } from "src/services/azure-blob.service";

@Controller('api/resident')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResidentController {
    constructor(
        private readonly residentService: ResidentService,
        private readonly azureBlobService: AzureBlobService,
    ) {}

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

    @Post(':id/profile-picture')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    async uploadProfilePicture(
        @Param('id') id: string,
        @Body() uploadImageDto: UploadImageDto
    ) {
        console.log('📸 Subiendo imagen de perfil para residente:', id);
        
        // Subir imagen a Azure Blob Storage
        const imageUrl = await this.azureBlobService.uploadImage(
            uploadImageDto.image,
            `resident-${id}`
        );
        
        // Actualizar el perfil del residente con la nueva URL
        const updatedResident = await this.residentService.updateResident(id, {
            profilePicture: imageUrl
        });
        
        console.log('✅ Imagen de perfil actualizada:', imageUrl);
        
        return {
            success: true,
            data: {
                profilePicture: imageUrl,
                resident: updatedResident
            }
        };
    }

    @Patch(':id/deactivate')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async deactivateResident(@Param('id') id: string) {
        console.log('🚫 Desactivando residente:', id);
        const resident = await this.residentService.deactivateResident(id);
        return {
            success: true,
            message: 'Residente desactivado exitosamente',
            data: resident
        };
    }

    @Post(':id/profile-picture/admin')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    async uploadProfilePictureByAdmin(
        @Param('id') id: string,
        @Body() uploadImageDto: UploadImageDto
    ) {
        console.log('📸 [ADMIN] Subiendo imagen de perfil para residente:', id);
        
        // Subir imagen a Azure Blob Storage
        const imageUrl = await this.azureBlobService.uploadImage(
            uploadImageDto.image,
            `resident-${id}`
        );
        
        // Actualizar el perfil del residente con la nueva URL
        const updatedResident = await this.residentService.updateResident(id, {
            profilePicture: imageUrl
        });
        
        console.log('✅ [ADMIN] Imagen de perfil actualizada:', imageUrl);
        
        return {
            success: true,
            message: 'Imagen de perfil del residente actualizada por administrador',
            data: {
                profilePicture: imageUrl,
                resident: updatedResident
            }
        };
    }

    @Patch(':id/activate')
    @HttpCode(HttpStatus.OK)
    @Roles('ADMIN')
    async activateResident(@Param('id') id: string) {
        console.log('✅ Activando residente:', id);
        const resident = await this.residentService.activateResident(id);
        return {
            success: true,
            message: 'Residente activado exitosamente',
            data: resident
        };
    }


}