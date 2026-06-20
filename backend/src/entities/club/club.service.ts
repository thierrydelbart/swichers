import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './club.entity';
import { Team } from '@entities/team/team.entity';
import { Game } from '@entities/game/game.entity';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private readonly repo: Repository<Club>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  async findOrCreate(name: string): Promise<Club> {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ name }));
  }

  async findById(id: number) {
    const club = await this.repo.findOne({ where: { id } });
    if (!club) throw new NotFoundException(`Club #${id} not found`);

    const teams = await this.teamRepo.find({
      where: { club: { id } },
      order: { category: 'DESC', name: 'ASC', suffix: 'ASC' },
    });

    if (teams.length === 0) {
      return { id: club.id, name: club.name, teams: [] };
    }

    const teamIds = teams.map((t) => t.id);

    const games = await this.gameRepo
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.team_a', 'ta')
      .innerJoinAndSelect('game.team_b', 'tb')
      .where('(ta.id IN (:...ids) OR tb.id IN (:...ids))', { ids: teamIds })
      .andWhere('game.score_a IS NOT NULL')
      .andWhere('game.score_b IS NOT NULL')
      .getMany();

    const wl = new Map<number, { wins: number; losses: number }>(
      teamIds.map((tid) => [tid, { wins: 0, losses: 0 }]),
    );

    for (const game of games) {
      const aId = game.team_a.id;
      const bId = game.team_b.id;
      const aWon = game.score_a! > game.score_b!;
      if (wl.has(aId)) {
        if (aWon) wl.get(aId)!.wins++;
        else wl.get(aId)!.losses++;
      }
      if (wl.has(bId)) {
        if (aWon) wl.get(bId)!.losses++;
        else wl.get(bId)!.wins++;
      }
    }

    return {
      id: club.id,
      name: club.name,
      teams: teams.map((t) => ({
        id: t.id,
        category: t.category,
        gender: t.gender,
        suffix: t.suffix,
        wins: wl.get(t.id)!.wins,
        losses: wl.get(t.id)!.losses,
      })),
    };
  }
}
