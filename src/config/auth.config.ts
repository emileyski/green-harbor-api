import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { AuthConfig } from './config.types';
import validateConfig from '../utils/validate-config';

class EnvironmentalVariablesValidator {
  @IsString()
  APPLICATION_URL: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', (): AuthConfig => {
  validateConfig(process.env, EnvironmentalVariablesValidator);

  return {
    applicationUrl: process.env.APPLICATION_URL,
    access_token_expires: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_expires: process.env.REFRESH_TOKEN_EXPIRES_IN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  };
});
