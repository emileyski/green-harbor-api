import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentType } from 'src/core/enums/payment-type.enum';
import { CreateOrderItemDto } from './create-order-item';

export class CreateOrderDto {
  @ApiProperty({
    description: 'The delivery address of the order',
    type: String,
    example: '1234 Main Street, Anytown, USA',
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiProperty({
    description: 'The payment type of the order',
    type: String,
    example: 'CASH',
  })
  @IsString()
  @IsNotEmpty()
  paymentType: PaymentType;

  @ApiProperty({
    description: 'The items of the order',
    type: [CreateOrderItemDto],
    example: [
      {
        productSupplyId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      },
    ],
  })
  @IsNotEmpty()
  orderItems: CreateOrderItemDto[];
}
