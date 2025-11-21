import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entities/user.entity";
import { LoginDto } from "src/dto/login.dto";

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,

    ) {}

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {

        const user = await this.userRepository.findOne({
            where: {email: loginDto.email},
        });

        console.log("Usuario encontrado:", user);

         if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
         throw new UnauthorizedException('Credenciales inválidas.');

        }

        const payload = { 
        sub: user.id, 
        email: user.email,
        user_type: user.user_type, 
        name: user.name
        };

        return {
        access_token: this.jwtService.sign(payload),
        };

    };

}