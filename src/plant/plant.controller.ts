import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { AccessTokenGuard } from 'src/core/guards/access-token.guard';
import { Role } from 'src/core/decorators/role.decorator';
import { Roles } from 'src/core/enums/roles.enum';
import { CreatePlantDto } from './dto/create-plant.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/file-upload.utils';
import { Public } from 'src/core/decorators/public.decorator';
import { PlantCharacteristic } from 'src/core/interfaces/plant-characteristic.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('plant')
@Controller('plant')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Post()
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      fileFilter: imageFileFilter,
    }),
  )
  create(@Body() createPlantDto: CreatePlantDto, @UploadedFiles() images) {
    // console.log(createPlantDto);
    return this.plantService.create(createPlantDto, images);
  }

  @Public()
  @Get()
  findAll() {
    return this.plantService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/name')
  updateName(@Param('id') id: string, @Body() name: string) {
    return this.plantService.updateName(id, name);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/description')
  updateDescription(@Param('id') id: string, @Body() description: string) {
    return this.plantService.updateDescription(id, description);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/characteristics')
  updateCharacteristics(
    @Param('id') id: string,
    @Body() characteristics: PlantCharacteristic[],
  ) {
    return this.plantService.updateCharacteristics(id, characteristics);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Patch(':id/category')
  updateCategory(@Param('id') id: string, @Body() categoryId: string) {
    return this.plantService.updateCategory(id, categoryId);
  }

  @UseGuards(AccessTokenGuard)
  @Role(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantService.remove(id);
  }
}
