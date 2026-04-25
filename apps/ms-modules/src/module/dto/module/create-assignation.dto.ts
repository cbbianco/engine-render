import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssignationDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  moduleId: string;
}