import { Roles } from 'src/core/enums/roles.enum';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index('IDX_EMAIL', { unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  token?: string;

  @Column({ default: Roles.BUYER })
  role: Roles;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ nullable: true })
  mobilePhone?: string;
}
