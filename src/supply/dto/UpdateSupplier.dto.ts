import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateSupplierDto {
  @ApiProperty({
    type: String,
    description: 'Name of the supplier',
    required: false,
    example: 'Supplier 1',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({
    type: String,
    description: 'Email of the supplier',
    required: false,
    example: 'supplier@nure.ua',
  })
  @IsOptional()
  @IsString()
  supplierEmail?: string;

  @ApiProperty({
    type: String,
    description: 'Phone of the supplier',
    required: false,
    example: '+380123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+380\d{9}$/)
  supplierPhone?: string;

  @ApiProperty({
    type: String,
    description: 'Address of the supplier',
    required: false,
    example: 'Address 1',
  })
  @IsOptional()
  @IsString()
  supplierAddress?: string;
}
