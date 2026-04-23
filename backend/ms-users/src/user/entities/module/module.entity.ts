import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEntity } from '../role/role.entity';
import { Expose, Transform } from 'class-transformer';

@Entity('modules')
export class ModuleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  uuid: string;

  @Column()
  path: string;

  @Expose({ name: 'path_active' })
  @Column({ name: 'path_active', type: 'int', default: 1 })
  @Transform(({ value, obj }) => {
    console.log('Valor recibido para path_active:', value);
    console.log('Objeto completo original:', obj);
    return value;
  })
  pathActive: number;

  @Column({ length: 20 })
  method: string;

  @Column({ default: 1 })
  order: number;

  @ManyToMany(() => RoleEntity, (role) => role.modules)
  roles: RoleEntity[];
}
