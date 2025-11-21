import { Controller, Patch, Body, UsePipes, ValidationPipe, HttpStatus, HttpCode, Param, Delete, Get, Post } from "@nestjs/common";
import { InvitationService } from "src/services/invitation.service";
import { UpdateInvitationStatusDto } from "src/dto/update-invitation-status.dto";
import { CreateInvitationDto } from "src/dto/create-invitation.dto";
import { Invitation } from "src/entities/invitation.entity";

@Controller('api/invitations')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) {}

    @Get('all')
    @HttpCode(HttpStatus.OK)
    async findAllInvitations(): Promise<{ success: boolean; data: Invitation[] }> {
        const data = await this.invitationService.findAll();
        return { success: true, data };
    }

    @Post(':residentId/add')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createInvitation(
        @Param('residentId') residentId: string,
        @Body() createInvitationDto: CreateInvitationDto,
    ): Promise<{ success: boolean; data: Invitation }> {
        const data = await this.invitationService.createInvitation(residentId, createInvitationDto);
        return { success: true, data };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findInvitationById(@Param('id') id: string): Promise<{ success: boolean; data: Invitation }> {
        const data = await this.invitationService.findById(id);
        return { success: true, data };
    }

    @Patch(':id/approve')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async approveInvitation(
        @Param('id') invitationId: string,
        @Body('notes') notes?: string,
    ): Promise<{ success: boolean; data: Invitation }> {
        const data = await this.invitationService.approveInvitation(invitationId, notes);
        return { success: true, data };
    }

    @Patch(':id/reject')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async rejectInvitation(
        @Param('id') invitationId: string,
        @Body('reason') reason?: string,
    ): Promise<{ success: boolean; data: Invitation }> {
        const data = await this.invitationService.rejectInvitation(invitationId, reason);
        return { success: true, data };
    }

    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async cancelInvitation(
        @Param('id') invitationId: string,
        @Body('reason') reason?: string,
    ): Promise<{ success: boolean; data: Invitation }> {
        const data = await this.invitationService.cancelInvitation(invitationId, reason);
        return { success: true, data };
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateInvitationStatus(
        @Param('id') invitationId: string,
        @Body() updateStatusDto: UpdateInvitationStatusDto,
    ): Promise<{ success: boolean; data: Invitation }> {
        const data = await this.invitationService.updateInvitationStatus(invitationId, updateStatusDto);
        return { success: true, data };
    }
}
