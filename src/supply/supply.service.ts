import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, ILike, In, Repository } from 'typeorm';
import { Supply } from './entities/supply.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantService } from 'src/plant/plant.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplierDto } from './dto/UpdateSupplier.dto';
import { CartDto } from './dto/cart.dto';

@Injectable()
export class SupplyService {
  constructor(
    private plantService: PlantService,
    @InjectRepository(Supply)
    private readonly supplyRepository: Repository<Supply>,
  ) {}

  getStatisticsOnTheSuppliesNumberAtTheWarehouse() {
    return this.supplyRepository
      .createQueryBuilder('supply')
      .select('plant.id', 'plantId')
      .addSelect('plant.name', 'plantName')
      .addSelect('SUM(supply.currentCount)', 'count')
      .leftJoin('supply.plant', 'plant')
      .groupBy('plant.id, plant.name')
      .getRawMany();
  }

  async getByIds(ids: string[]): Promise<Supply[]> {
    return this.supplyRepository.findByIds(ids);
  }

  async createSupply(createSupplyDto: CreateSupplyDto) {
    const plant = await this.plantService.findOne(createSupplyDto.plantId);

    if (!plant)
      throw new NotFoundException(
        `Plant with ID ${createSupplyDto.plantId} found`,
      );

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

    if (!supply) throw new NotFoundException(`Supply with ID ${id} not found`);

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

  async updateSupplierData(id: string, supplierDto: UpdateSupplierDto) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
    });

    if (!supply)
      throw new BadRequestException(`Supply with ID ${id} not found`);

    this.supplyRepository.merge(supply, supplierDto);

    await this.supplyRepository.save(supply);

    const updatedSupply = await this.supplyRepository.findOne({
      where: { id },
    });

    return updatedSupply;
  }

  async updateCount(id: string, count: number) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
    });

    if (!supply)
      throw new BadRequestException(`Supply with ID ${id} not found`);

    supply.currentCount = count;

    await this.supplyRepository.save(supply);

    const updatedSupply = await this.supplyRepository.findOne({
      where: { id },
    });

    return updatedSupply;
  }

  async updatePrice(id: string, price: number) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
    });

    if (!supply)
      throw new BadRequestException(`Supply with ID ${id} not found`);

    supply.price = price;

    await this.supplyRepository.save(supply);

    const updatedSupply = await this.supplyRepository.findOne({
      where: { id },
    });

    return updatedSupply;
  }

  async updateExpiryDate(id: string, expiryDate: Date) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
    });

    if (!supply)
      throw new BadRequestException(`Supply with ID ${id} not found`);

    supply.expirationDate = expiryDate;

    await this.supplyRepository.save(supply);

    const updatedSupply = await this.supplyRepository.findOne({
      where: { id },
    });

    return updatedSupply;
  }

  async getAllInStock(
    name?: string,
    sortBy?: string,
    ascending?: 'ASC' | 'DESC',
    minPrice?: number,
    maxPrice?: number,
  ) {
    let order: { [key: string]: 'ASC' | 'DESC' } = {};

    if (sortBy === 'price') {
      order = { price: ascending };
    } else if (sortBy === 'quantity') {
      order = { count: ascending }; // Replace 'count' with the actual field name in your plant entity
    }

    const supplies = await this.supplyRepository.find({
      where: {
        inSale: true,
        plant: { name: name ? ILike(`%${name.toLowerCase()}%`) : undefined },

        price: minPrice && maxPrice ? Between(minPrice, maxPrice) : undefined,
      },
      relations: ['plant'],
      order,
    });

    return supplies.map((supply) => ({
      ...supply,
      plant: {
        ...supply.plant,
        pictures: supply.plant.pictures.map(
          (picture) => `${process.env.APPLICATION_URL}/files/${picture}`,
        ),
      },
    }));
  }
  async getOneInStock(id: string) {
    const supply = await this.supplyRepository.findOne({
      where: { id, inSale: true },
      relations: ['plant'],
    });

    if (!supply) throw new NotFoundException(`Supply with ID ${id} not found`);

    return {
      ...supply,
      plant: {
        ...supply.plant,
        pictures: supply.plant.pictures.map(
          (picture) => `${process.env.APPLICATION_URL}/files/${picture}`,
        ),
      },
    };
  }

  async getAll() {
    const supplies = await this.supplyRepository.find({
      relations: ['plant', 'orderItems'],
    });

    return supplies.map((supply) => ({
      ...supply,
      plant: {
        ...supply.plant,
        pictures: supply.plant.pictures.map(
          (picture) => `${process.env.APPLICATION_URL}/files/${picture}`,
        ),
      },
    }));
  }

  async getOne(id: string) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
      relations: ['plant', 'orderItems'],
    });

    if (!supply) throw new NotFoundException(`Supply with ID ${id} not found`);

    return {
      ...supply,
      plant: {
        ...supply.plant,
        pictures: supply.plant.pictures.map(
          (picture) => `${process.env.APPLICATION_URL}/files/${picture}`,
        ),
      },
    };
  }

  async delete(id: string) {
    const deleteResult = await this.supplyRepository.delete(id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Supply with ID ${id} not found`);
    }

    return { message: `Supply with ID ${id} deleted` };
  }

  async updateMany(supplies: Supply[]) {
    const updateResult = await this.supplyRepository.save(supplies);

    return updateResult;
  }

  async getCartData(cartDto: CartDto) {
    const { cartItems } = cartDto;

    const supplies = await this.supplyRepository.findBy({
      id: In(cartItems.map((item) => item.supplyId)),
      inSale: true,
    });

    let total = 0;

    const suppliesWithCount = await Promise.all(
      supplies.map(async (supply) => {
        const cartItem = cartItems.find((item) => item.supplyId === supply.id);

        delete supply.supplierAddress;
        delete supply.supplierEmail;
        delete supply.supplierName;
        delete supply.supplierPhone;

        total += supply.price * cartItem.count;
        const plant = (await this.getOne(supply.id)).plant;

        delete plant.description;
        delete plant.characteristics;

        return {
          //здесь нужно доставать информацию о plant
          plant,
          ...supply,
          count: cartItem.count,
          subtotal: supply.price * cartItem.count,
        };
      }),
    );

    return { cart: suppliesWithCount, total };
  }
}
