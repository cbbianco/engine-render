import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Representa cada ruta/permiso asignado al usuario
 */
export class PathDTO {
  @IsString()
  @IsNotEmpty()
  method: string = '';

  @IsString()
  @IsNotEmpty()
  path: string = '';

  @IsNumber()
  pathActive: number = 0;

  @IsNumber()
  order: number = 0;
}

/**
 * Representa la información del usuario dentro de un dominio específico
 */
export class UserDomainDTO {
  @IsString()
  @IsNotEmpty()
  userName: string = '';

  @IsString()
  password?: string = '';

  @IsNumber()
  roleId: number = 0;

  @IsNumber()
  isActive: number = 0;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PathDTO)
  path: PathDTO[] = [];

  @IsNumber()
  pathActive: number = 0;
}

/**
 * Estructura principal del Payload del JWT
 */
export class ExtractTokenDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDomainDTO)
  content: Record<string, UserDomainDTO>;

  @IsString()
  iv: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}
