import {
  Entity,
  ObjectIdColumn,
  Column,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Usamos interfaces para definir la forma de los datos sin restringir la persistencia
export interface IEndpoint {
  method: string;
  uri: string;
  endpoint?: string; // Antes tag
  backend?: string;  // Nuevo
  bodySource?: string;
  methodSource?: string;
}

export interface IComponent {
  id: string;
  type: string;
  label: string;
  property: string;
  options?: any[];
  value?: string;
  column: string;
  align: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean; // Nuevo: Control de bloqueo
  validation: any; // Flexibilizado para soportar string o objeto
  values?: any[]; // Nuevo: Soporta strings, objetos o macros expandidas
  config?: any; // Flexibilizado para configuraciones de 'draw'
  endpoint?: IEndpoint;
}

@Entity('modules')
export class ModuleConfigEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  modulo: string;

  @Column()
  userId: string;

  @Column()
  instruccion: string;

  @Column('json')
  configurationUi: {
    config: {
      method: string;
      module: string;
      order: number;
      orchestrationType: string;
      path: string;
      domain: string;
      menu: string; // Nuevo: Soporte para "menu:Padre" o "menu-item:..."
      dataSource?: string; // Nuevo: Soporte para "token", etc.
      isReauthenticating?: boolean; // Nuevo: Re-autenticación obligatoria
    };
    schema: IComponent[];
    model: any;
  };

  @Column('json')
  orchestrationDetails: {
    status: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
