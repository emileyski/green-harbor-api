import { ApiProperty } from '@nestjs/swagger';

export class CartDto {
  @ApiProperty({
    example: [
      {
        supplyId: '1',
        count: 2,
      },
    ],
    description: 'Array of supplies with count',
    type: 'array',
  })
  cartItems: { supplyId: string; count: number }[];
}
