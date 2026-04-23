import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ModuleEntity } from './module.entity'; // Ajusta la ruta según tu estructura

@Entity('assignation_module')
@Unique('unique_user_module', ['userId', 'moduleId']) // Define la restricción de unicidad a nivel clase
export class AssignationModuleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'module_id', type: 'bigint', unsigned: true })
  moduleId: number;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 50 })
  createdBy: string;

  @Column({ name: 'updated_by', length: 50, nullable: true })
  updatedBy: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'module_id' })
  module: ModuleEntity;
}
