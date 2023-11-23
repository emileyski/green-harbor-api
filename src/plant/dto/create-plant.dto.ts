import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { PlantCharacteristic } from 'src/core/interfaces/plant-characteristic.interface';

export class CreatePlantDto {
  @ApiProperty({
    description: 'The name of the plant',
    type: String,
    required: true,
    default: 'My Plant',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the plant',
    type: String,
    required: true,
    default: 'My Plant',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  //как проверить, что характеристики должны быть объектом такого типа:
  // {name:string, value:string}?

  @ApiProperty({
    description: 'Characteristics of the plant',
    type: Array,
    isArray: true,
    required: true,
    example: [{ name: 'Characteristic1', value: 'Value1' }],
  })
  @IsNotEmpty()
  @IsObject()
  characteristics: PlantCharacteristic[];

  @ApiProperty({
    description: 'The category id of the plant',
    type: String,
    required: true,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
