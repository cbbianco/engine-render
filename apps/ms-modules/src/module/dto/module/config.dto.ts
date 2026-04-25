import { IsString, IsNotEmpty, IsObject, ValidateNested, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { MetadataDto } from './metadata.dto';
import { BreadcrumbDto } from './breadcrumb.dto';

export class ConfigDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BreadcrumbDto)
  breadcrumb?: BreadcrumbDto[];

  @IsString() @IsNotEmpty() module: string;
  @IsString() @IsOptional() formId?: string;
  @IsString() @IsNotEmpty() path: string;
  @IsString() @IsNotEmpty() method: string;
  @IsNumber() @IsNotEmpty() order: number;

  @IsOptional() menu?: any;
  @IsOptional() icon?: any;
  @IsString() @IsOptional() moduleId?: string;

  @IsBoolean()
  @IsOptional()
  isReauthenticating?: boolean;

  @IsBoolean()
  @IsOptional()
  isModuleInner?: boolean;

  @IsArray()
  @IsOptional()
  toolbar?: any[];

  @IsArray()
  @IsOptional()
  toolbarTopLeft?: any[];

  @IsArray()
  @IsOptional()
  toolbarTopRight?: any[];

  @IsArray()
  @IsOptional()
  toolbarBottomLeft?: any[];

  @IsArray()
  @IsOptional()
  toolbarBottomRight?: any[];

  @IsArray()
  @IsOptional()
  footerToolbar?: any[];

  @IsObject()
  @IsOptional()
  actions?: any;
}
