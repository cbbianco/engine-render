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
    confirmPassword?: string;

    @Expose()
    @IsString()
    @IsOptional()
    role?: string;

    // --- Visual Customization (CamelCase y Nombres Originales) ---
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

    @Expose()
    @IsString()
    @IsOptional()
    logoUrl?: string;

    // logoFile se maneja en el controlador
}
