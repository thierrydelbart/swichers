import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Officer } from './officer.entity';

@Injectable()
export class OfficerService {
  constructor(
    @InjectRepository(Officer)
    private readonly repo: Repository<Officer>,
  ) {}

  async findOrCreate(name: string): Promise<Officer> {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ name }));
  }
}
