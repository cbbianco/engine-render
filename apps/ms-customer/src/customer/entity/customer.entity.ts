import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { ColorCss } from '../dto/color-css .dto';
import { CustomerLoginTextsDto } from '../dto/text.dto';

@Entity('customers')
export class CustomerEntity {
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

  @Column()
  logo: string;

  @Column()
  loginTexts: CustomerLoginTextsDto;

  @Column()
  colorCss: ColorCss;
}
