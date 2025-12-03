import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VehicleController } from "src/controllers/vehicle.controller";
import { VehicleService } from "src/services/vehicle.service";
import { Vehicle } from "src/entities/vehicle.entity";
import { Resident } from "src/entities/resident.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Vehicle, Resident])
    ],
    controllers: [VehicleController],
    providers: [VehicleService],
    exports: [VehicleService]
})
export class VehicleModule {}
