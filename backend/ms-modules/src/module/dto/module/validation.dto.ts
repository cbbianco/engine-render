import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ValidationDto {
  @IsString() @IsOptional() pattern?: string;
  @IsString() @IsOptional() message?: string;
  @IsString() @IsOptional() rule?: string;
  @IsBoolean() @IsOptional() active?: boolean;
}
