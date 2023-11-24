import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { UserId } from 'src/core/decorators/user-id.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@UserId() id: string) {
    return this.userService.getProfile(id);
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
}
