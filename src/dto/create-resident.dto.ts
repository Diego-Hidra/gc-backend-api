import { IsNotEmpty, IsEmail, Matches, MinLength } from 'class-validator';

export class CreateResidentDTO {

    @IsNotEmpty({message: 'El RUT no puede estar vacío'})
    rut: string;

    @IsNotEmpty({message: 'El nombre es obligatorio'})
    name: string;

    @IsNotEmpty({message: 'El apellido es obligatorio'})
    lastname: string;

    @IsEmail({}, {message: 'El correo debe estar en un formato válido'})
    @IsNotEmpty({message: 'El correo es obligatorio'})
    email: string;
    
    @IsNotEmpty({message: 'El número de teléfono es obligatorio'})
    phone_number: string;

    @IsNotEmpty({message: 'La contraseña es obligatoria'})
    @MinLength(8, {message: 'La contraseña debe tener al menos 8 caracteres'})
    password: string;

    @IsNotEmpty({message: 'El piso debe ser incluido'})
    floor: string

    @IsNotEmpty({message: 'Se debe seleccionar un departamento'})
    apartament: string;
}