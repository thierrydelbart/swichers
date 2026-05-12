import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';

const LEAGUE_NAMES: Record<string, string> = {
  '0034': "Comité de l'Hérault",
};

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League)
    private readonly repo: Repository<League>,
  ) {}

  async findOrCreate(code: string): Promise<League> {
    const existing = await this.repo.findOne({ where: { code } });
    if (existing) return existing;
    const name = LEAGUE_NAMES[code] ?? code;
    return this.repo.save(this.repo.create({ code, name }));
  }
}
