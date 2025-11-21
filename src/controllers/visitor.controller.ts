import { Controller, Post, Patch, Body, UsePipes, ValidationPipe, HttpStatus, HttpCode, Param, Get } from "@nestjs/common";
import { VisitorService } from "src/services/visitor.service";
import { CreateVisitorDto } from "src/dto/create-visitor.dto";
import { UpdateVisitorStatusDto } from "src/dto/update-visitor-status.dto";
import { Visitor } from "src/entities/visitor.entity";

@Controller('api/visitors')
export class VisitorController {
    constructor(private readonly visitorService: VisitorService) {}

    @Get('all')
    @HttpCode(HttpStatus.OK)
    async findAllVisitors(): Promise<{ success: boolean; data: Visitor[] }> {
        const data = await this.visitorService.findAll();
        return { success: true, data };
    }

    @Post(':residentId/add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createVisitor(
        @Param('residentId') residentId: string,
        @Body() createVisitorDto: CreateVisitorDto,
    ): Promise<{ success: boolean; data: Visitor }> {
        const data = await this.visitorService.createVisitor(residentId, createVisitorDto);
        return { success: true, data };
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateVisitorStatus(
        @Param('id') visitorId: string,
        @Body() updateStatusDto: UpdateVisitorStatusDto,
    ): Promise<{ success: boolean; data: Visitor }> {
        const data = await this.visitorService.updateVisitorStatus(visitorId, updateStatusDto);
        return { success: true, data };
    }
}
