import { IsObject, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigDto } from './config.dto';
import { ComponentDto } from './component.dto';

export class ConfigurationUiDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConfigDto)
  config: ConfigDto;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ComponentDto)
  schema: ComponentDto[];

  @IsObject()
  @IsOptional()
  model?: any;

  @IsArray()
  @IsOptional()
  schemaChild?: any[];

  @IsObject()
  @IsOptional()
  actions?: any;
}
