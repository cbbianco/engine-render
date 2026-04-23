import {
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('modules')
export class GenerateJsonDto {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  modulo: string;

  @Column()
  userId: number;

  @Column()
  instruccion: string;

  @Column({ type: 'json' })
  configurationUi: {
    config: any;
    schema: any[];
    model: any;
    schemaChild?: any[];
  };

  @Column({ type: 'json', nullable: true })
  orchestrationDetails: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}