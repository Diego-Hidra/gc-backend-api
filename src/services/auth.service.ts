import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { Resident } from "src/entities/resident.entity";
import { LoginDto } from "src/dto/login.dto";

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(Resident)
        private residentRepository: Repository<Resident>,
        private jwtService: JwtService,

    ) {}

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {

        const user = await this.residentRepository.findOne({
            where: {email: loginDto.email}
        });

        console.log("Usuario encontrado:", user);

         if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
         throw new UnauthorizedException('Credenciales inválidas.');

        }

        const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role, 
        firstName: user.firstName,
        lastName: user.lastName
        };

        return {
        access_token: this.jwtService.sign(payload),
        };

    };

}