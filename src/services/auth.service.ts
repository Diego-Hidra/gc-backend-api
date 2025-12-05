import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entities/user.entity";
import { LoginDto } from "src/dto/login.dto";
import { Resident } from "src/entities/resident.entity";
import { Guard } from "src/entities/guard.entity";
import { Admin } from "src/entities/admin.entity";

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(Resident)
        private residentRepository: Repository<Resident>,
        @InjectRepository(Guard)
        private guardRepository: Repository<Guard>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        private jwtService: JwtService,

    ) {}

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        console.log('\n🔐 AUTH SERVICE - Procesando login');
        console.log('📧 Email:', loginDto.email);

        // Solo buscar en residents (login exclusivo para residentes)
        const user = await this.residentRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!user) {
            console.error('❌ Residente no encontrado:', loginDto.email);
            throw new UnauthorizedException('Credenciales inválidas. Solo residentes pueden acceder.');
        }
        
        console.log('✅ Residente encontrado:', {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            block: user.block,
            apartment: user.apartment
        });

        const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
        console.log('🔑 Validación de contraseña:', passwordMatch ? 'Correcta' : 'Incorrecta');
        
        if (!passwordMatch) {
            console.error('❌ Contraseña incorrecta para:', loginDto.email);
            throw new UnauthorizedException('Credenciales inválidas.');
        }

        // Datos del residente
        const floor = user.floor;
        const apartament = user.apartment;
        const block = user.block;
        const lotNumber = user.lotNumber;
        console.log('🏢 Datos de residente:', { floor, apartament, block, lotNumber });

        const payload = { 
            sub: user.id, 
            email: user.email,
            user_type: user.role, 
            name: user.firstName + ' ' + user.lastName,
            floor: floor,
            apartament: apartament,
            block: block,
            lotNumber: lotNumber
        };

        const access_token = this.jwtService.sign(payload);
        console.log('🎫 Token JWT generado exitosamente');
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        return { access_token };
    };

}