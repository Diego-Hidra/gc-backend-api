import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResidentController } from "src/controllers/resident.controller";
import { ResidentService } from "src/services/resident.service";
import { AzureBlobService } from "src/services/azure-blob.service";
import { Resident } from "src/entities/resident.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Resident])
    ],
    controllers: [ResidentController],
    providers: [ResidentService, AzureBlobService],
    exports: [ResidentService, AzureBlobService]
})
export class ResidentModule {}