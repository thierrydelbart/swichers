import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Championship } from '../championship/championship.entity';
import { Group } from './group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly repo: Repository<Group>,
  ) {}

  async findOrCreate(name: string, championship: Championship): Promise<Group> {
    const existing = await this.repo.findOne({
      where: { name, championship: { id: championship.id } },
    });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ name, championship }));
  }
}
