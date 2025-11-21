import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResidentController } from "src/controllers/resident.controller";
import { ResidentService } from "src/services/resident.service";
import { Resident } from "src/entities/resident.entity";
import { FrequentVisitorModule } from "./frequent-visitor.module";
import { VisitorModule } from "./visitor.module";
import { InvitationModule } from "./invitation.module";
import { VehicleModule } from "./vehicle.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Resident]),
        forwardRef(() => FrequentVisitorModule),
        forwardRef(() => VisitorModule),
        forwardRef(() => InvitationModule),
        forwardRef(() => VehicleModule)
    ],
    controllers: [ResidentController],
    providers: [ResidentService],
    exports: [ResidentService]
})
export class ResidentModule {}
