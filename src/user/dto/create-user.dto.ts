import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Roles } from 'src/core/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'example@nure.ua',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
    type: String,
    required: true,
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'BUYER',
    type: String,
    required: false,
    enum: Roles,
  })
  role?: Roles;
}
