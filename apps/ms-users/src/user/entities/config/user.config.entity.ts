import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('customers')
export class UserConfigEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  @Index({ unique: true })
  customer: string;

  @Column()
  @Index({ unique: true })
  userName: string;

  @Column()
  publicKey: string;

  @Column()
  privateKey: string;

  @Column({ nullable: true })
  logo?: string;

  @Column('json', { nullable: true })
  colorCss?: {
    primary: string;
    secondary: string;
    errorColor: string;
  };

  @Column('json', { nullable: true })
  loginTexts?: Record<string, any>;
}
