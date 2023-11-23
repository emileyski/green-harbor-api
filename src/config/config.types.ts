export type AuthConfig = {
  applicationUrl: string;
  // secret: string;
  access_token_expires: string;
  refresh_token_expires: string;
  accessSecret: string;
  refreshSecret: string;
};

export type DatabaseConfig = {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
};

export type AllConfigType = {
  database: DatabaseConfig;
  auth: AuthConfig;
};
