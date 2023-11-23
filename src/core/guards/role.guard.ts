import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../enums/roles.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const role = this.reflector.getAllAndOverride<Roles>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!role) return true;

    const request = context.switchToHttp().getRequest();

    if (request?.user) {
      const user = request.user as JwtPayload;

      // console.log('user', user);

      return role === user.role;
    }

    return false;
  }
}
