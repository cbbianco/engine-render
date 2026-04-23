import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class BreadcrumbDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  path?: string;
}
