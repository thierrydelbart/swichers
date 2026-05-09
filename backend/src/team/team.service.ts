import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { Team } from './team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

  async findOne(id: number): Promise<object> {
    const team = await this.repo.findOne({
      where: { id },
      relations: ['club'],
    });
    if (!team) throw new NotFoundException(`Team #${id} not found`);
    return {
      id: team.id,
      name: team.suffix ? `${team.name} ${team.suffix}` : team.name,
      category: team.category,
      gender: team.gender,
    };
  }

  async findOrCreate(
    name: string,
    suffix: string | null,
    category: TeamCategory,
    gender: Gender,
    club: Club,
  ): Promise<Team> {
    const existing = await this.repo.findOne({
      where: {
        name,
        suffix: suffix || undefined,
        category,
        gender,
        club: { id: club.id },
      },
    });
    if (existing) return existing;
    return this.repo.save(
      this.repo.create({ name, suffix, category, gender, club }),
    );
  }
}
