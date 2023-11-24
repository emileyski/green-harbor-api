import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from 'src/core/decorators/public.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenGuard } from 'src/core/guards/refresh-token.guard';
import { User } from 'src/core/decorators/user.decorator';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Public()
  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @User('refreshToken') refreshToken: string,
    @User('id') userId: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Post('log-out')
  async logout(@User('id') userId: string) {
    return this.authService.logout(userId);
  }
}
