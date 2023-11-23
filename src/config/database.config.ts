import { registerAs } from '@nestjs/config';
import { IsNumber, IsString } from 'class-validator';
import { DatabaseConfig } from './config.types';
import validateConfig from '../utils/validate-config';

class EnvironmentalVariablesValidator {
  // @IsString()
  // DATABASE_URL: string;

  @IsString()
  POSTGRES_HOST: string;

  @IsNumber()
  POSTGRES_PORT: number;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;
}

export default registerAs<DatabaseConfig>('database', (): DatabaseConfig => {
  validateConfig(process.env, EnvironmentalVariablesValidator);

  return {
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT, 10),
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
  };
});
