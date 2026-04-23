import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UserProfileDto {

    @Expose()
    @IsString()
    @IsOptional()
    firstName?: string;

    @Expose()
    @IsString()
    @IsOptional()
    lastName?: string;

    @Expose()
    @IsString()
    @IsOptional()
    userName?: string;

    @Expose()
    @IsString()
    @IsOptional()
    password?: string;

    @Expose()
    @IsString()
    @IsOptional()
    confirmarPassword?: string;

    @Expose()
    @IsOptional()
    btnActualizarPerfil?: any;
}