import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { Coach } from './coach.entity';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly repo: Repository<Coach>,
  ) {}

  async findOrCreate(
    lastName: string,
    firstName: string,
    club: Club,
  ): Promise<Coach> {
    const existing = await this.repo.findOne({
      where: {
        last_name: lastName,
        first_name: firstName,
        club: { id: club.id },
      },
    });
    if (existing) return existing;
    return this.repo.save(
      this.repo.create({ last_name: lastName, first_name: firstName, club }),
    );
  }
}
