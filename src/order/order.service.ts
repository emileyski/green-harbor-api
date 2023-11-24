import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './entities/order-status.entity';
import { SupplyService } from 'src/supply/supply.service';
import { OrderStatus as OrderStatusEnum } from 'src/core/enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    private readonly supplyService: SupplyService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const supplies = await this.supplyService.getByIds(
      createOrderDto.orderItems.map((item) => item.productSupplyId),
    );

    const totalPrice = supplies.reduce(
      (acc, supply) =>
        acc +
        supply.price *
          createOrderDto.orderItems.find(
            (item) => item.productSupplyId === supply.id,
          ).quantity,
      0,
    );

    const order = this.orderRepository.create({
      deliveryAddress: createOrderDto.deliveryAddress,
      paymentType: createOrderDto.paymentType,
      currentStatus: OrderStatusEnum.CREATED,
      user: { id: userId },
      totalPrice,
    });

    await this.orderRepository.save(order);

    const orderStatus = this.orderStatusRepository.create({
      status: OrderStatusEnum.CREATED,
      order: { id: order.id },
    });

    await this.orderStatusRepository.save(orderStatus);

    const orderItems = createOrderDto.orderItems.map((item) =>
      this.orderItemRepository.create({
        quantity: item.quantity,
        supply: { id: item.productSupplyId },
        order: { id: order.id },
        subtotal:
          supplies.find((supply) => supply.id === item.productSupplyId).price *
          item.quantity,
      }),
    );

    await this.orderItemRepository.save(orderItems);

    return { ...order, orderStatuses: [orderStatus] };
  }

  async findAllByUserId(userId: string) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: [
        'orderItems',
        'orderItems.supply',
        'orderItems.supply.plant',
        'orderStatuses',
      ],
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        user: { id: userId },
        currentStatus: OrderStatusEnum.CREATED,
      },
      relations: ['orderStatuses'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    order.currentStatus = OrderStatusEnum.CANCELED;

    const orderStatus = this.orderStatusRepository.create({
      status: OrderStatusEnum.CANCELED,
      order: { id: order.id },
    });

    await this.orderRepository.save(order);
    await this.orderStatusRepository.save(orderStatus);

    return { ...order, orderStatuses: [...order.orderStatuses, orderStatus] };
  }

  //#region Admin actions

  async findAll() {
    return this.orderRepository.find({
      relations: [
        'orderItems',
        'orderItems.supply',
        'orderItems.supply.plant',
        'orderStatuses',
      ],
    });
  }

  async setInProgress(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderStatuses'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (order.currentStatus !== OrderStatusEnum.CREATED)
      throw new BadRequestException(
        `Order with ID ${id} is not in CREATED status`,
      );

    order.currentStatus = OrderStatusEnum.IN_PROGRESS;

    const orderStatus = this.orderStatusRepository.create({
      status: OrderStatusEnum.IN_PROGRESS,
      order: { id: order.id },
    });

    await this.orderRepository.save(order);
    await this.orderStatusRepository.save(orderStatus);

    return { ...order, orderStatuses: [...order.orderStatuses, orderStatus] };
  }

  async setPacked(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderStatuses', 'orderItems', 'orderItems.supply'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (order.currentStatus !== OrderStatusEnum.IN_PROGRESS)
      throw new BadRequestException(
        `Order with ID ${id} is not in IN_PROGRESS status`,
      );

    order.currentStatus = OrderStatusEnum.PACKED;

    const orderStatus = this.orderStatusRepository.create({
      status: OrderStatusEnum.PACKED,
      order: { id: order.id },
    });

    await this.orderRepository.save(order);
    await this.orderStatusRepository.save(orderStatus);

    const supplies = await this.supplyService.getByIds(
      order.orderItems.map((item) => item.supply.id),
    );

    supplies.forEach((supply) => {
      const orderItem = order.orderItems.find(
        (item) => item.supply.id === supply.id,
      );
      supply.currentCount -= orderItem.quantity;
    });

    await this.supplyService.updateMany(supplies);

    return { ...order, orderStatuses: [...order.orderStatuses, orderStatus] };
  }

  async setInDelivery(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderStatuses'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (order.currentStatus !== OrderStatusEnum.PACKED)
      throw new BadRequestException(
        `Order with ID ${id} is not in PACKED status`,
      );

    order.currentStatus = OrderStatusEnum.IN_DELIVERY;

    const orderStatus = this.orderStatusRepository.create({
      status: OrderStatusEnum.IN_DELIVERY,
      order: { id: order.id },
    });

    await this.orderRepository.save(order);
    await this.orderStatusRepository.save(orderStatus);

    return { ...order, orderStatuses: [...order.orderStatuses, orderStatus] };
  }

  async setDelivered(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderStatuses'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (order.currentStatus !== OrderStatusEnum.IN_DELIVERY)
      throw new BadRequestException(
        `Order with ID ${id} is not in IN_DELIVERY status`,
      );

    order.currentStatus = OrderStatusEnum.DELIVERED;

    const orderStatus = this.orderStatusRepository.create({
      status: OrderStatusEnum.DELIVERED,
      order: { id: order.id },
    });

    await this.orderRepository.save(order);
    await this.orderStatusRepository.save(orderStatus);

    return { ...order, orderStatuses: [...order.orderStatuses, orderStatus] };
  }

  async setPaid(id: string, userId: string) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['orderStatuses'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (order.currentStatus !== OrderStatusEnum.DELIVERED)
      throw new BadRequestException(
        `Order with ID ${id} is not in DELIVERED status`,
      );

    order.currentStatus = OrderStatusEnum.PAID;

    const orderStatusPaid = this.orderStatusRepository.create({
      status: OrderStatusEnum.PAID,
      order: { id: order.id },
    });

    const orderStatusCompleted = this.orderStatusRepository.create({
      status: OrderStatusEnum.COMPLETED,
      order: { id: order.id },
    });

    await this.orderRepository.save(order);
    await this.orderStatusRepository.save(orderStatusPaid);
    await this.orderStatusRepository.save(orderStatusCompleted);

    return {
      ...order,
      orderStatuses: [
        ...order.orderStatuses,
        orderStatusPaid,
        orderStatusCompleted,
      ],
    };
  }

  //#endregion
}
