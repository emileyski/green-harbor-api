import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplyService } from './supply.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { Role } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/enums/roles.enum';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { User } from 'src/core/decorators/user.decorator';
import { RoleGuard } from 'src/core/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSupplierDto } from './dto/UpdateSupplier.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { CartDto } from './dto/cart.dto';
import { UserId } from 'src/core/decorators/user-id.decorator';

@ApiTags('supply')
@Controller('supply')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Get('in-stock')
  async getAllInStock(
    @Query('name') name: string,
    @Query('sort-by') sortBy: string,
    @Query('asc') asc: 'ASC' | 'DESC',
    @Query('min-price') minPrice: number,
    @Query('max-price') maxPrice: number,
  ) {
    return this.supplyService.getAllInStock(
      name,
      sortBy,
      asc,
      minPrice,
      maxPrice,
    );
  }

  @Get('count-statistics')
  async getCountStatistics() {
    return this.supplyService.getStatisticsOnTheSuppliesNumberAtTheWarehouse();
  }

  @Get(':id/in-stock')
  async getOneInStock(@Param('id') id: string) {
    return this.supplyService.getOneInStock(id);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Get('all')
  async getAll() {
    return this.supplyService.getAll();
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Post()
  async createSupply(
    @Body() createSupplyDto: CreateSupplyDto,
    @UserId() userId: string,
  ) {
    // console.log('user', user);
    return this.supplyService.createSupply(createSupplyDto, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/to-stock')
  async putToStock(@Param('id') id: string) {
    return this.supplyService.putToStock(id);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/remove-from-stock')
  async removeFromStock(@Param('id') id: string) {
    return this.supplyService.removeFromStock(id);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/supplier')
  updateSupplier(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplyService.updateSupplierData(id, updateSupplierDto);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/count')
  updateCount(@Param('id') id: string, @Body() count: number) {
    return this.supplyService.updateCount(id, count);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/price')
  updatePrice(@Param('id') id: string, @Body() price: number) {
    return this.supplyService.updatePrice(id, price);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/expiry-date')
  updateExpiryDate(@Param('id') id: string, @Body() expiryDate: Date) {
    return this.supplyService.updateExpiryDate(id, expiryDate);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.supplyService.delete(id);
  }

  @Public()
  @Post('/cart')
  async getCartData(@Body() cartDto: CartDto) {
    return this.supplyService.getCartData(cartDto);
  }
}
