import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResidentController } from "src/controllers/resident.controller";
import { ResidentService } from "src/services/resident.service";
import { Resident } from "src/entities/resident.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Resident])
    ],
    controllers: [ResidentController],
    providers: [ResidentService],
    exports: [ResidentService]
})
export class ResidentModule {}