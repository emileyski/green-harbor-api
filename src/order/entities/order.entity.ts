import { OrderStatus as OrderStatusEnum } from 'src/core/enums/order-status.enum';
import { PaymentType } from 'src/core/enums/payment-type.enum';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.entity';

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

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.CREATED,
  })
  currentStatus: OrderStatusEnum;

  @OneToMany(() => OrderStatus, (orderStatus) => orderStatus.order, {
    onDelete: 'CASCADE',
  })
  orderStatuses: OrderStatusEnum[];

  @Column()
  deliveryAddress: string;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.CASH })
  paymentType: PaymentType;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    onDelete: 'CASCADE',
  })
  orderItems: OrderItem[];
}
