import { Controller, Post, Get, Body, UsePipes, ValidationPipe, HttpStatus, HttpCode, Param, Delete, UseGuards } from "@nestjs/common";
import { FrequentVisitorService } from "src/services/frequent-visitor.service";
import { CreateInvitationFromFrequentDto } from "src/dto/create-invitation-from-frequent.dto";
import { CreateFrequentVisitorDto } from "src/dto/create-frequent-visitor.dto";
import { FrequentVisitor } from "src/entities/frequent-visitor.entity";
import { Invitation } from "src/entities/invitation.entity";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('api/frequent-visitors')
@UseGuards(JwtAuthGuard)
export class FrequentVisitorController {
    constructor(private readonly frequentVisitorService: FrequentVisitorService) {}

    @Get('resident/:residentId')
    @HttpCode(HttpStatus.OK)
    async getFrequentVisitorsByResident(
        @Param('residentId') residentId: string
    ): Promise<{ success: boolean; data: FrequentVisitor[] }> {
        const data = await this.frequentVisitorService.findFrequentVisitorsByResident(residentId);
        return { success: true, data };
    }

    @Post(':residentId/add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createFrequentVisitor(
        @Param('residentId') residentId: string,
        @Body() createDto: CreateFrequentVisitorDto
    ): Promise<{ success: boolean; data: FrequentVisitor }> {
        const data = await this.frequentVisitorService.createFrequentVisitor(residentId, createDto);
        return { success: true, data };
    }

    @Post(':id/create-invitation')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createInvitationFromFrequent(
        @Param('id') frequentVisitorId: string,
        @Body() createDto: CreateInvitationFromFrequentDto,
    ): Promise<{ success: boolean; data: FrequentVisitor; invitation: Invitation }> {
        const result = await this.frequentVisitorService.createInvitationFromFrequent(frequentVisitorId, createDto);
        return { success: true, data: result.frequentVisitor, invitation: result.invitation };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteFrequentVisitor(@Param('id') frequentVisitorId: string): Promise<{ success: boolean; data: FrequentVisitor }> {
        const data = await this.frequentVisitorService.deleteFrequentVisitor(frequentVisitorId);
        return { success: true, data };
    }
}
