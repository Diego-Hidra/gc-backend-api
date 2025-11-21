import { Controller, Post, Body, UsePipes, ValidationPipe, HttpStatus, HttpCode, Param, Delete } from "@nestjs/common";
import { FrequentVisitorService } from "src/services/frequent-visitor.service";
import { CreateInvitationFromFrequentDto } from "src/dto/create-invitation-from-frequent.dto";
import { FrequentVisitor } from "src/entities/frequent-visitor.entity";
import { Invitation } from "src/entities/invitation.entity";

@Controller('api/frequent-visitors')
export class FrequentVisitorController {
    constructor(private readonly frequentVisitorService: FrequentVisitorService) {}

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
