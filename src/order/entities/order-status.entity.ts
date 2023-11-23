import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderStatus as OrderStatusEnum } from 'src/core/enums/order-status.enum';
import { Order } from './order.entity';

@Entity()
export class OrderStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: OrderStatusEnum;

  @Column({ default: new Date() })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.orderStatuses, {
    onDelete: 'CASCADE',
  })
  order: Order;
}
