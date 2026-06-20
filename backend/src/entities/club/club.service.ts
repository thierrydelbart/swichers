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

  async findNews(clubId: number, teamId?: number) {
    const club = await this.repo.findOne({ where: { id: clubId } });
    if (!club) throw new NotFoundException(`Club #${clubId} not found`);

    const qb = this.gameRepo
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.team_a', 'ta')
      .innerJoinAndSelect('game.team_b', 'tb')
      .innerJoinAndSelect('ta.club', 'ca')
      .innerJoinAndSelect('tb.club', 'cb')
      .innerJoinAndSelect('game.group', 'grp')
      .innerJoinAndSelect('grp.championship', 'champ')
      .where('game.blog_title IS NOT NULL');

    if (teamId !== undefined) {
      qb.andWhere('(ta.id = :teamId OR tb.id = :teamId)', { teamId });
    } else {
      qb.andWhere('(ca.id = :clubId OR cb.id = :clubId)', { clubId });
    }

    const games = await qb.orderBy('game.day', 'DESC').limit(20).getMany();

    return games.map((g) => {
      const dayStr = g.day as unknown as string;
      const [y, m, d] = dayStr.split('-');
      return {
        id: g.id,
        date: `${d}/${m}/${y}`,
        championship: g.group.championship.name,
        team_a: {
          id: g.team_a.id,
          name: g.team_a.name,
          suffix: g.team_a.suffix,
        },
        team_b: {
          id: g.team_b.id,
          name: g.team_b.name,
          suffix: g.team_b.suffix,
        },
        score_a: g.score_a,
        score_b: g.score_b,
        blog_title: g.blog_title,
        blog_content: g.blog_content,
      };
    });
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
