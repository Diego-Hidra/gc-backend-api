import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, HttpStatus, HttpCode, Get, Param } from "@nestjs/common";
import { ResidentService } from "src/services/resident.service";
import { CreateResidentDTO } from "src/dto/create-resident.dto";
import { Resident } from "src/entities/resident.entity";

@Controller('api/resident')
export class ResidentController {
    constructor(private readonly residentService: ResidentService) {}

    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    async addResident (
        @Body() createResidentDTO: CreateResidentDTO,
    ): Promise<Resident> {

        return this.residentService.createResident(createResidentDTO)
    }

    @Get('all')
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Resident[]>{
        return this.residentService.findAllResidents();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findByID(@Param('id') id: string): Promise<Resident> {
        
        return this.residentService.findResidentsByID(id);
    }

}