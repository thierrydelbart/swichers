import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { Championship } from './championship.entity';
import { League } from '../league/league.entity';

@Injectable()
export class ChampionshipService {
  constructor(
    @InjectRepository(Championship)
    private readonly repo: Repository<Championship>,
  ) {}

  async findOrCreate(
    name: string,
    season: string,
    shortCode: string | null,
    category: TeamCategory,
    gender: Gender,
    league: League,
  ): Promise<Championship> {
    const existing = await this.repo.findOne({ where: { name, season } });
    if (existing) {
      if (!existing.league) {
        existing.league = league;
        await this.repo.save(existing);
      }
      return existing;
    }
    return this.repo.save(
      this.repo.create({
        name,
        season,
        short_code: shortCode,
        category,
        gender,
        league,
      }),
    );
  }
}
