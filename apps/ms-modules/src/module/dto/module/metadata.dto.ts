import { IsString, IsNotEmpty } from 'class-validator';

export class MetadataDto {
  @IsString()
  @IsNotEmpty()
  orchestrationType: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
