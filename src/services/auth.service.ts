import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entities/user.entity";
import { LoginDto } from "src/dto/login.dto";
import { Resident } from "src/entities/resident.entity";

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

        let floor: string | undefined;
        let apartament: string | undefined;
        
        console.log("Usuario encontrado:", user);

         if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
         throw new UnauthorizedException('Credenciales inválidas.');

        }

        if (user instanceof Resident) {
            
            floor = user.floor;
            apartament = user.apartament;
        }


        const payload = { 
        sub: user.id, 
        email: user.email,
        user_type: user.user_type, 
        name: user.name,
        floor: floor,
        apartament: apartament
        };

        return {
        access_token: this.jwtService.sign(payload),
        };

    };

}