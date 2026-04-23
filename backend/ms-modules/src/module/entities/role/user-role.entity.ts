import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RoleEntity } from './role.entity';

@Entity('users_roles')
export class UserRoleEntity {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @PrimaryColumn({ name: 'role_id', type: 'int' })
  roleId: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 50, nullable: true })
  createdBy: string | null;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RoleEntity;
}
