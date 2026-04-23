import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ModuleEntity } from '../module/module.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @OneToMany(() => UserEntity, (user) => user.id)
  users: UserEntity[];

  @ManyToMany(() => ModuleEntity, (module) => module.roles)
  @JoinTable({
    name: 'roles_modules',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'module_id', referencedColumnName: 'id' },
  })
  modules: ModuleEntity[];
}
