import { ObjectId } from 'mongodb';

export class PathResponseDto {
  path: string;
  method: string;
  order: number;
  pathActive: number;
}

export class ModelResponseDto {
  error?: Array<string>;

  message: string;

  id?: ObjectId;

  path?: Array<PathResponseDto>;
}

export interface BaseModuleConfig {
  _id: string | ObjectId;
  modulo: string;
  userId: string;
  instruccion: string;
  configurationUi: any;
  orchestrationDetails: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface HydratedModuleConfig extends BaseModuleConfig {
  path: PathResponseDto[];
}

export interface ConsultModuleResponseDto {
  modules: BaseModuleConfig[];
  path: PathResponseDto[];
}