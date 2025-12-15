import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth.module";
import { FrequentVisitorController } from "src/controllers/frequent-visitor.controller";
import { FrequentVisitorService } from "src/services/frequent-visitor.service";
import { FrequentVisitor } from "src/entities/frequent-visitor.entity";
import { Resident } from "src/entities/resident.entity";
import { Invitation } from "src/entities/invitation.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([FrequentVisitor, Resident, Invitation]),
        AuthModule
    ],
    controllers: [FrequentVisitorController],
    providers: [FrequentVisitorService],
    exports: [FrequentVisitorService]
})
export class FrequentVisitorModule {}
