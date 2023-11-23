import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/roles.enum';

export const Role = (role: Roles) => SetMetadata('role', role);
