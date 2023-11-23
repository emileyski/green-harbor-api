import { Module } from '@nestjs/common';
import { SupplyService } from './supply.service';
import { SupplyController } from './supply.controller';
import { Supply } from './entities/supply.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantModule } from 'src/plant/plant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supply]), PlantModule],
  controllers: [SupplyController],
  providers: [SupplyService],
})
export class SupplyModule {}
