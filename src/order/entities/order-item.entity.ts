import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Supply } from 'src/supply/entities/supply.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => Supply, (supply) => supply.orderItems, {
    onDelete: 'CASCADE',
  })
  supply: Supply;
}
