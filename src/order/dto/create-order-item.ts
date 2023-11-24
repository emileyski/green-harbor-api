import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'The id of the product supply',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productSupplyId: string;

  @ApiProperty({
    description: 'The quantity of the product supply',
    type: Number,
    example: 5,
  })
  quantity: number;
}
