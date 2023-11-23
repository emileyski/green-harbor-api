import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { IsUUIDGuard } from './core/guards/is-uuid.guard';
import { AuthModule } from './auth/auth.module';
import { PlantModule } from './plant/plant.module';
import { FilesModule } from './files/files.module';
import { CategoryModule } from './category/category.module';
import { SupplyModule } from './supply/supply.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, databaseConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    UserModule,
    AuthModule,
    PlantModule,
    FilesModule,
    CategoryModule,
    SupplyModule,
    OrderModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: IsUUIDGuard,
    },
  ],
})
export class AppModule {}
