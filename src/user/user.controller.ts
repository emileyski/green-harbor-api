import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/enums/roles.enum';
import { RoleGuard } from 'src/core/guards/role.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('signup-statistics')
  async getRegistrationStatistics() {
    return this.userService.getRegistrationStatistics();
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Get('all')
  async getAll() {
    return this.userService.getAll();
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@UserId() id: string) {
    return this.userService.getProfile(id);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Put(':id/as-admin')
  async updateAsAdmin(@Param('id') id: string, @Body() updateDto: any) {
    return this.userService.updateAsAdmin(id, updateDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('name')
  async updateName(@UserId() id: string, @Body('name') name: string) {
    return this.userService.updateName(id, name);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('email')
  async updateEmail(@UserId() id: string, @Body('email') email: string) {
    return this.userService.updateEmail(id, email);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('password')
  async updatePassword(
    @UserId() id: string,
    @Body('password') password: string,
  ) {
    return this.userService.updatePassword(id, password);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('phone')
  async updatePhone(@UserId() id: string, @Body('phone') phone: string) {
    return this.userService.updatePhone(id, phone);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Role(Roles.ADMIN)
  @Patch('role')
  async updateRole(@UserId() id: string, @Body('role') role: Roles) {
    return this.userService.updateRole(id, role);
  }
}
