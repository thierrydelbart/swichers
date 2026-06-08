import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './venue.entity';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue)
    private readonly repo: Repository<Venue>,
  ) {}

  async findOrCreate(name: string): Promise<Venue> {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ name }));
  }
}
