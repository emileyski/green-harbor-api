import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { Plant } from './entities/plant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesService } from 'src/files/files.service';
import { PlantCharacteristic } from 'src/core/interfaces/plant-characteristic.interface';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class PlantService {
  constructor(
    private filesService: FilesService,
    private categoryService: CategoryService,
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,
  ) {}

  async create(createPlantDto: CreatePlantDto, files: any) {
    const images = await this.filesService.saveMany(files);

    const plant = this.plantRepository.create({
      ...createPlantDto,
      characteristics: JSON.parse(
        createPlantDto.characteristics,
      ) as PlantCharacteristic[],
      pictures: images.map((image) => image.id),
      category: { id: createPlantDto.categoryId },
    });

    await this.plantRepository.save(plant);

    plant.pictures = this.convertPicturesToUrls(plant.pictures);

    return plant;
  }

  async findAll() {
    const plants = await this.plantRepository.find();

    return plants.map((plant) => {
      plant.pictures = this.convertPicturesToUrls(plant.pictures);
      return plant;
    });
  }

  async findOne(id: string) {
    const plant = await this.plantRepository.findOne({ where: { id } });

    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);

    plant.pictures = this.convertPicturesToUrls(plant.pictures);

    return plant;
  }

  async updateName(id: string, name: string) {
    const plant = await this.plantRepository.findOne({ where: { id } });

    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);

    plant.name = name;

    await this.plantRepository.save(plant);

    return plant;
  }

  async updateDescription(id: string, description: string) {
    const plant = await this.plantRepository.findOne({ where: { id } });

    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);

    plant.description = description;

    await this.plantRepository.save(plant);

    return plant;
  }

  async updateCharacteristics(
    id: string,
    characteristics: PlantCharacteristic[],
  ) {
    const plant = await this.plantRepository.findOne({ where: { id } });

    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);

    plant.characteristics = characteristics;

    await this.plantRepository.save(plant);

    return plant;
  }

  async updateCategory(id: string, categoryId: string) {
    const plant = await this.plantRepository.findOne({ where: { id } });

    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);

    const category = await this.categoryService.findOne(categoryId);

    if (!category)
      throw new NotFoundException(`Category with ID ${categoryId} not found`);

    plant.category = category;

    await this.plantRepository.save(plant);

    return plant;
  }

  async findByIds(ids: string[]) {
    return this.plantRepository.findByIds(ids);
  }

  //TODO: implement pictures update

  async remove(id: string) {
    console.log(id);

    const plant = await this.plantRepository.findOne({ where: { id } });

    if (!plant) throw new NotFoundException(`Plant with ID ${id} not found`);

    await this.plantRepository.delete({ id });

    await this.filesService.deleteFilesByIds(plant.pictures as string[]);

    return { message: `Plant with ID ${id} removed successfully` };
  }

  //#region utils
  convertPicturesToUrls(pictures: string[]) {
    return pictures.map((picture) => {
      return `${process.env.APPLICATION_URL}/files/${picture}`;
    });
  }
  //#endregion
}
