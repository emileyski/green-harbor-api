import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateSupplyDto {
  @ApiProperty({
    description: 'The count of the supply',
    type: Number,
    required: true,
    example: 100,
  })
  @Min(1)
  @Max(10_000)
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'The price of the supply',
    type: Number,
    required: true,
    example: 100,
  })
  @Min(1)
  @Max(10_000)
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'The supplier name of the supply',
    type: String,
    required: true,
    example: 'Supplier1',
  })
  @IsNotEmpty()
  @IsString()
  supplierName: string;

  @ApiProperty({
    description: 'The supplier phone of the supply',
    type: String,
    required: true,
    example: '+380123456789',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{12}$/)
  supplierPhone: string;

  @ApiProperty({
    description: 'The supplier address of the supply',
    type: String,
    required: true,
    example: 'Supplier1 Address',
  })
  @IsNotEmpty()
  @IsString()
  supplierAddress: string;

  @ApiProperty({
    description: 'The supplier email of the supply',
    type: String,
    required: true,
    example: 'supplier@nure.ua',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\w+@\w+\.\w+$/)
  supplierEmail: string;

  @ApiProperty({
    description: 'The expiration date of the supply',
    type: Date,
    required: true,
    example: '2021-07-22T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsString()
  expirationDate: Date;

  @ApiProperty({
    description: 'The plant id of the supply',
    type: String,
    required: true,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  plantId: string;
}
