import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class IsUUIDGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;

    if (!id) {
      return true;
    }

    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    return true;
  }
}
