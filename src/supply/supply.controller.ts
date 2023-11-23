import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SupplyService } from './supply.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { Role } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/enums/roles.enum';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { User } from 'src/core/decorators/user.decorator';
import { RoleGuard } from 'src/core/guards/role.guard';

@Controller('supply')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Get('in-stock')
  async getAllInStock() {
    return this.supplyService.getAllInStock();
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
  async createSupply(@Body() createSupplyDto: CreateSupplyDto) {
    // console.log('user', user);
    return this.supplyService.createSupply(createSupplyDto);
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
}
