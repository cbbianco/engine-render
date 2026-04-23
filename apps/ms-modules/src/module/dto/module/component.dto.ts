import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsObject,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ValidationDto } from './validation.dto';
import { EndpointDto } from '../config/endpoint/endpoint.dto';

export class ComponentDto {
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsNotEmpty() label: string;

  @IsString()
  @IsOptional()
  property?: string;

  @IsOptional() @IsArray() options?: any[];
  @IsString() @IsOptional() value?: string;

  @IsString() @IsOptional() name?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^col-(12|[1-9]|1[0-1])$/)
  column: string;

  @IsString() @IsNotEmpty() align: string;

  @IsOptional() @IsObject() config?: any;

  @IsString() @IsOptional() placeholder?: string;
  @IsString() @IsOptional() bodySource?: string;

  /** Control de estado inicial para el renderer Vue3 */
  @IsBoolean() @IsOptional() visible?: boolean;
  @IsBoolean() @IsOptional() disabled?: boolean;
  @IsBoolean() @IsOptional() readonly?: boolean;
  @IsBoolean() @IsOptional() separator?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ValidationDto)
  validation?: ValidationDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EndpointDto)
  endpoint?: EndpointDto;

  @IsOptional()
  @IsArray()
  values?: string | any[];

  @IsOptional()
  @IsArray()
  columns?: any[];
}
