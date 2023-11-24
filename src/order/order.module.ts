import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './entities/order-status.entity';
import { SupplyModule } from 'src/supply/supply.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderStatus]),
    SupplyModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
