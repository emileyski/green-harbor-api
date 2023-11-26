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
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import * as pdfMakePrinter from 'pdfmake/src/printer';

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

  async getPopularPlants() {
    const data = await this.orderItemRepository.query(
      `SELECT
      plant.id AS plant_id,
      plant.name AS plant_name,
      COUNT(*) AS purchase_count
    FROM
      order_item
    JOIN
      supply ON order_item."supplyId" = supply.id
    JOIN
      plant ON supply."plantId" = plant.id
    GROUP BY
      plant.id, plant.name
    ORDER BY
      purchase_count DESC;    
      `,
    );

    return data;
  }

  getStatisticsOnTheNumberOfOrdersByDay() {
    return this.orderRepository.query(
      `SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count FROM "order" GROUP BY day ORDER BY day DESC LIMIT 7`,
    );
  }

  getStatisticsOnTheTotalPriceOfOrdersByDay() {
    return this.orderRepository.query(
      `SELECT DATE_TRUNC('day', "createdAt") AS day, SUM("totalPrice") AS sum FROM "order" GROUP BY day ORDER BY day DESC LIMIT 7`,
    );
  }

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const supplies = await this.supplyService.getByIds(
      createOrderDto.orderItems.map((item) => item.productSupplyId),
    );

    if (!supplies.length) throw new BadRequestException('No supplies found');

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

  async cancelAsAdmin(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
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
      relations: ['orderStatuses', 'user'],
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (order.currentStatus !== OrderStatusEnum.DELIVERED)
      throw new BadRequestException(
        `Order with ID ${id} is not in DELIVERED status`,
      );

    order.currentStatus = OrderStatusEnum.COMPLETED;
    order.completedAt = new Date();

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

    // Генерация квитанции в PDF
    const pdfFileName = `receipt_${order.id}.pdf`;
    const pdfPath = path.join(__dirname, pdfFileName);
    const pdfStream = fs.createWriteStream(pdfPath);

    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new pdfMakePrinter(fonts);

    const docDefinition = {
      content: [
        { text: 'Receipt', style: 'header' },
        // Добавляем информацию о заказе в таблицу
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Parameter', 'Value'],
              ['Order ID', order.id],
              ['Total Price', order.totalPrice],
              ['Payment Type', order.paymentType],
              ['Delivery Address', order.deliveryAddress],
              ['User ID', order.user.id],
              ['User Email', order.user.email],
            ],
          },
        },
        {
          text: `Receipt generated on: ${new Date().toLocaleString()}`,
          style: 'date',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        date: {
          fontSize: 10,
          italic: true,
          alignment: 'right',
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(pdfStream);
    pdfDoc.end();

    // Отправка квитанции на почту пользователя
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'bohdan.ilienko@nure.ua', pass: 'cewholrtxflavjru' },
    });

    const mailOptions = {
      from: 'ваш_email@gmail.com',
      to: order.user.email,
      subject: 'Payment Receipt',
      text: 'Пожалуйста, найдите вложенную квитанцию.',
      attachments: [
        {
          filename: pdfFileName,
          path: pdfPath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Ошибка при отправке почты:', error);
      } else {
        console.log('Email отправлен: ' + info.response);
      }

      // Удаление временного PDF-файла после отправки
      fs.unlinkSync(pdfPath);
    });

    delete order.user;

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
