import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth.module";
import { VisitorController } from "src/controllers/visitor.controller";
import { VisitorService } from "src/services/visitor.service";
import { Visitor } from "src/entities/visitor.entity";
import { Resident } from "src/entities/resident.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Visitor, Resident]),
        AuthModule
    ],
    controllers: [VisitorController],
    providers: [VisitorService],
    exports: [VisitorService]
})
export class VisitorModule {}
