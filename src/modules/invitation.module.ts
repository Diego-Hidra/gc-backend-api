import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth.module";
import { InvitationController } from "src/controllers/invitation.controller";
import { InvitationService } from "src/services/invitation.service";
import { Invitation } from "src/entities/invitation.entity";
import { Resident } from "src/entities/resident.entity";
import { Visitor } from "src/entities/visitor.entity";
import { FrequentVisitor } from "src/entities/frequent-visitor.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Invitation, Resident, Visitor, FrequentVisitor]),
        AuthModule
    ],
    controllers: [InvitationController],
    providers: [InvitationService],
    exports: [InvitationService]
})
export class InvitationModule {}
