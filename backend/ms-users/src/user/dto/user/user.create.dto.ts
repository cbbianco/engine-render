import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserCreateDto {

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    firstName?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    lastName?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    userName?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password?: string;

    @Expose()
    @IsString()
    @IsOptional()
    confirmarPassword?: string;

    @Expose()
    @IsString()
    @IsOptional()
    role?: string;

    @Expose()
    @IsOptional()
    btnActualizarPerfil?: any;

    @Expose()
    @IsString()
    @IsOptional()
    primary?: string;

    @Expose()
    @IsString()
    @IsOptional()
    secondary?: string;

    @Expose()
    @IsString()
    @IsOptional()
    errorColor?: string;
}
