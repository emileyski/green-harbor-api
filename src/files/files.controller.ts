import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../utils/file-upload.utils';
import { Public } from 'src/core/decorators/public.decorator';
import { FilesService } from './files.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('files (some work in test mode)')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file) {
    return this.filesService.saveOne(file);
  }

  @Public()
  @Post('uploadMultipleFiles')
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files) {
    return this.filesService.saveMany(files);
  }

  @Public()
  @Get(':fileId')
  async getFile(@Param('fileId') fileId, @Res() res: Response) {
    const file = await this.filesService.getFileById(fileId);

    if (!file) {
      throw new NotFoundException();
    }

    // Устанавливаем заголовки для отправки изображения
    res.setHeader('Content-Type', file.filename.split('.')[1]);
    res.send(file.data);
  }
}
