import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  findByHash(hash: string): Promise<File | null> {
    return this.fileRepository.findOne({ where: { hash } });
  }

  findById(id: number): Promise<File | null> {
    return this.fileRepository.findOne({ where: { id } });
  }

  async persist(
    name: string,
    hash: string,
    uploadDir: string,
    buffer: Buffer,
  ): Promise<File> {
    await fs.mkdir(uploadDir, { recursive: true });
    const location = path.join(uploadDir, `${hash}.pdf`);
    await fs.writeFile(location, buffer);
    const file = this.fileRepository.create({
      name,
      location,
      hash,
      extractedData: null,
    });
    return this.fileRepository.save(file);
  }

  async updateExtractedData(id: number, data: object): Promise<void> {
    await this.fileRepository.update(id, { extractedData: data });
  }
}
