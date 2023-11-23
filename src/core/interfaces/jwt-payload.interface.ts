import { Roles } from '../enums/roles.enum';

export interface JwtPayload {
  id: string;
  role: Roles;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}
