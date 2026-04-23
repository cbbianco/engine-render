import {
  IsOptional,
  IsObject,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConfigurationUiDto } from './configuration-ui.dto';

export class ModuleRequestDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConfigurationUiDto)
  configurationUi: ConfigurationUiDto;

  @IsObject()
  @IsOptional()
  bodyModel?: any;

  @IsObject()
  @IsOptional()
  orchestrationDetails?: {
    status: string;
  };
}
