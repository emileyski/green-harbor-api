import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { RoleGuard } from 'src/core/guards/role.guard';
import { Role } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/enums/roles.enum';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @UserId() userId: string) {
    return this.orderService.create(createOrderDto, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('as-buyer')
  findAllByUserId(@UserId() userId: string) {
    return this.orderService.findAllByUserId(userId);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Get('as-admin')
  findAll() {
    return this.orderService.findAll();
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/in-progress')
  setInProgress(@Param('id') id: string) {
    return this.orderService.setInProgress(id);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/packed')
  setPacked(@Param('id') id: string) {
    return this.orderService.setPacked(id);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/in-delivery')
  setInDelivery(@Param('id') id: string) {
    return this.orderService.setInDelivery(id);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/delivered')
  setDelivered(@Param('id') id: string) {
    return this.orderService.setDelivered(id);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.BUYER)
  @Patch(':id/paid')
  setPaid(@Param('id') id: string, @UserId() userId: string) {
    return this.orderService.setPaid(id, userId);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.BUYER)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @UserId() userId: string) {
    return this.orderService.cancel(id, userId);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/cancel/as-admin')
  cancelAsAdmin(@Param('id') id: string) {
    return this.orderService.cancelAsAdmin(id);
  }
}
