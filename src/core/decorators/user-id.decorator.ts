import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const UserId = createParamDecorator(
  (_, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Проверяем, существует ли user и имеет ли он свойство 'id'
    if (user && user.id) {
      return user.id;
    }

    // Возвращаем значение по умолчанию, если user или user.id не существует
    return undefined; // Замените на ваше значение по умолчанию
  },
);
