import { Expose, Transform } from 'class-transformer';

export class UserPayloadDto {
  @Expose()
  userName: string;

  @Expose()
  password: string;

  roleId: number;

  isActive: number;

  @Expose()
  publicKey: string;

  @Expose()
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  path: Array<Path>;
}

export class Path {
  method: string;

  path: string;

  order: number;

  @Expose({ name: 'path_active' })
  pathActive: number;
}
