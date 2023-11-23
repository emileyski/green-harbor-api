import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { File } from './file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async saveOne(file): Promise<{ filename: string; id: string }> {
    // console.log(file);

    const newFile = new File();
    newFile.filename = file.originalname;
    newFile.data = file.buffer;

    await this.fileRepository.save(newFile);
    return { filename: file.originalname, id: newFile.id };
  }

  async saveMany(files): Promise<{ filename: string; id: string }[]> {
    const response = [];
    for (const file of files) {
      const newFile = new File();
      newFile.filename = file.originalname;
      newFile.data = file.buffer;

      await this.fileRepository.save(newFile);
      response.push({ filename: file.originalname, id: newFile.id });
    }
    return response;
  }

  async getFileById(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException();
    }

    return file;
  }

  async deleteFileById(id: string): Promise<DeleteResult> {
    return this.fileRepository.delete({ id });
  }

  async deleteFilesByIds(ids: string[]): Promise<DeleteResult> {
    return this.fileRepository.delete(ids);
  }
}
