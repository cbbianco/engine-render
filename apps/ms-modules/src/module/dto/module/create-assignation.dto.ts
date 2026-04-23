import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssignationDto {
  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsString()
  @IsNotEmpty()
  moduleId: string;
}