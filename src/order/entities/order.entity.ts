import { OrderStatus } from 'src/core/enums/order-status.enum';
import { PaymentType } from 'src/core/enums/payment-type.enum';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  totalPrice: number;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @Column()
  deliveryAddress: string;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.CASH })
  paymentType: PaymentType;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;
}
