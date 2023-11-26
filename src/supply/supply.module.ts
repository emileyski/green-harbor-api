import { Module } from '@nestjs/common';
import { SupplyService } from './supply.service';
import { SupplyController } from './supply.controller';
import { Supply } from './entities/supply.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantModule } from 'src/plant/plant.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supply]), PlantModule, UserModule],
  controllers: [SupplyController],
  providers: [SupplyService],
  exports: [SupplyService],
})
export class SupplyModule {}
