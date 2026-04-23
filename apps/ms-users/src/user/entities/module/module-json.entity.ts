import {
  Entity,
  ObjectIdColumn,
  Column,
  ObjectId,
} from 'typeorm';

export interface IComponent {
  id?: string;
  type?: string;
  label: string;
  property?: string;
  options?: any[];
  /** Flag for visual separators (section headers) */
  separator?: boolean;
  value?: string;
  column?: string;
  align?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  validation?: any;
  values?: any[];
  config?: any;
}

@Entity('modules')
export class ModuleConfigEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  modulo: string;

  @Column('json')
  configurationUi: {
    config: {
      isModuleInner?: boolean;
      toolbar?: any[];
      actions?: any;
      [key: string]: any;
    };
    schema: IComponent[];
    schemaChild?: any[];
    model: any;
    actions?: any;
  };
}
