import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Supply } from './entities/supply.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantService } from 'src/plant/plant.service';
import { CreateSupplyDto } from './dto/create-supply.dto';

@Injectable()
export class SupplyService {
  constructor(
    private plantService: PlantService,
    @InjectRepository(Supply)
    private readonly supplyRepository: Repository<Supply>,
  ) {}

  async createSupply(createSupplyDto: CreateSupplyDto) {
    const plant = await this.plantService.findOne(createSupplyDto.plantId);

    if (!plant)
      throw new Error(`Plant with ID ${createSupplyDto.plantId} found`);

    const supply = this.supplyRepository.create({
      ...createSupplyDto,
      currentCount: createSupplyDto.count,
      plant: { id: plant.id },
    });

    return this.supplyRepository.save(supply);
  }

  async putToStock(id: string) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!supply) throw new Error(`Supply with ID ${id} not found`);

    const otherSupplies = await this.supplyRepository.find({
      where: { plant: { id: supply.plant.id }, inSale: true },
    });

    if (otherSupplies.length > 0) {
      throw new BadRequestException(
        `There are other supplies of this plant in sale. Please, sell them first`,
      );
    }

    supply.inSale = true;

    await this.supplyRepository.save(supply);

    return supply;
  }

  async removeFromStock(id: string) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
    });

    if (!supply || !supply.inSale)
      throw new BadRequestException(
        `Supply with ID ${id} not found or already removed from stock`,
      );

    supply.inSale = false;

    await this.supplyRepository.save(supply);

    return supply;
  }

  async getAllInStock() {
    const supplies = await this.supplyRepository.find({
      where: { inSale: true },
      relations: ['plant'],
    });

    return supplies;
  }

  //TODO: add saled relations
  async getAll() {
    const supplies = await this.supplyRepository.find({
      relations: ['plant'],
    });

    return supplies;
  }
}
