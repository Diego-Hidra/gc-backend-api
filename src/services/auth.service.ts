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
        const profilePicture = user.profilePicture;
        console.log('🏢 Datos de residente:', { floor, apartament, block, lotNumber, profilePicture });

        const payload = { 
            sub: user.id, 
            email: user.email,
            user_type: user.role, 
            name: user.firstName + ' ' + user.lastName,
            floor: floor,
            apartament: apartament,
            block: block,
            lotNumber: lotNumber,
            profilePicture: profilePicture
        };

        const access_token = this.jwtService.sign(payload);
        console.log('🎫 Token JWT generado exitosamente');
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        return { access_token };
    };

    async loginResident(loginDto: LoginDto): Promise<{ access_token: string; resident_id: string }> {
        console.log('\n🔐 AUTH SERVICE - Procesando login de residente');
        console.log('📧 Email:', loginDto.email);

        // Buscar residente por email
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
        const profilePicture = user.profilePicture;

        const payload = { 
            sub: user.id, 
            email: user.email,
            user_type: user.role, 
            name: user.firstName + ' ' + user.lastName,
            floor: floor,
            apartament: apartament,
            block: block,
            lotNumber: lotNumber,
            profilePicture: profilePicture
        };

        const access_token = this.jwtService.sign(payload);
        console.log('🎫 Token JWT generado exitosamente');
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        return { 
            access_token,
            resident_id: user.id
        };
    };

    async loginAdmin(loginDto: LoginDto): Promise<{ access_token: string }> {
    const admin = await this.adminRepository.findOne({ where: { email: loginDto.email } });

    if (!admin) {
        throw new UnauthorizedException('Credenciales inválidas. Solo administradores pueden acceder.');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, admin.password);
    if (!passwordMatch) {
        throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = {
        sub: admin.id,
        email: admin.email,
        user_type: 'admin',
        name: admin.firstName + ' ' + admin.lastName,
    };

    return { access_token: this.jwtService.sign(payload) };
    };

    async loginGuard(loginDto: LoginDto): Promise<{ access_token: string }> {
    const guard = await this.guardRepository.findOne({ where: { email: loginDto.email } });

    if (!guard) {
        throw new UnauthorizedException('Credenciales inválidas. Solo guardias pueden acceder.');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, guard.password);
    if (!passwordMatch) {
        throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = {
        sub: guard.id,
        email: guard.email,
        user_type: 'guard',
        name: guard.firstName + ' ' + guard.lastName,
    };

    return { access_token: this.jwtService.sign(payload) };
    };

}