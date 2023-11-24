import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from 'src/core/interfaces/jwt-payload.interface';
import { Tokens } from 'src/core/interfaces/tokens.interface';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.types';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async signup(signupDto: SignUpDto): Promise<Tokens> {
    const { id, role } = await this.usersService.create(signupDto);

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      role,
    });

    return { accessToken, refreshToken };
  }

  async signin(signInDto: SignInDto): Promise<Tokens> {
    const { id, role, password } = await this.usersService.findByEmail(
      signInDto.email,
    );
    const isPasswordValid = await verify(password, signInDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      role,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, token: string): Promise<Tokens> {
    const { token: hashedRefreshToken, role } =
      await this.usersService.findById(userId);

    if (!hashedRefreshToken) {
      throw new ForbiddenException('Invalid refresh token');
    }
    const isRefreshTokenValid = await verify(hashedRefreshToken, token);

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Invalid refresh token');
    }
    console.log(userId, role);

    const { accessToken, refreshToken } = await this.generateTokens({
      id: userId,
      role,
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Logged out successfully' };
  }

  //#region token generation

  private async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(
        payload,
        this.configService.getOrThrow('auth.access_token_expires', {
          infer: true,
        }),
        this.configService.getOrThrow('auth.accessSecret', {
          infer: true,
        }),
      ),
      this.signToken(
        payload,
        this.configService.getOrThrow('auth.refresh_token_expires', {
          infer: true,
        }),
        this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
      ),
    ]);
    const hashedRefreshToken = await hash(refreshToken);
    await this.usersService.updateRefreshToken(payload.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  private async signToken(
    payload: JwtPayload,
    expiresIn: string,
    secret: string,
  ) {
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }
  //#endregion
}
