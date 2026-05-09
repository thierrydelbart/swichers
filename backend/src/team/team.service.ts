import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { Team } from './team.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';

function sum(rows: PlayerStatRow[], fn: (r: PlayerStatRow) => number): number {
  return rows.reduce((acc, r) => acc + fn(r), 0);
}

function avg(rows: PlayerStatRow[], fn: (r: PlayerStatRow) => number): number {
  return Math.round((sum(rows, fn) / rows.length) * 10) / 10;
}

function formatAvgTime(rows: PlayerStatRow[]): string {
  const totalSec = Math.round(sum(rows, (r) => r.time_played) / rows.length);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
    @InjectRepository(PlayerStatRow)
    private readonly psrRepo: Repository<PlayerStatRow>,
  ) {}

  async findOne(id: number): Promise<object> {
    const team = await this.repo.findOne({
      where: { id },
      relations: ['club'],
    });
    if (!team) throw new NotFoundException(`Team #${id} not found`);

    const rows = await this.psrRepo
      .createQueryBuilder('psr')
      .innerJoinAndSelect('psr.player', 'player')
      .innerJoinAndSelect('player.club', 'club')
      .innerJoinAndSelect('psr.game', 'game')
      .innerJoinAndSelect('game.group', 'grp')
      .innerJoinAndSelect('grp.championship', 'champ')
      .innerJoin('game.team_a', 'ta')
      .innerJoin('game.team_b', 'tb')
      .where('club.id = :clubId', { clubId: team.club.id })
      .andWhere('(ta.id = :teamId OR tb.id = :teamId)', { teamId: id })
      .getMany();

    const games_played = new Set(rows.map((r) => r.game.id)).size;
    const championships = [
      ...new Set(
        rows.map(
          (r) =>
            `${r.game.group.championship.name} ${r.game.group.championship.season}`,
        ),
      ),
    ];

    const byPlayer = new Map<number, PlayerStatRow[]>();
    for (const row of rows) {
      const pid = row.player.id;
      if (!byPlayer.has(pid)) byPlayer.set(pid, []);
      byPlayer.get(pid)!.push(row);
    }

    const players = [...byPlayer.values()].map((playerRows) => {
      const p = playerRows[0].player;
      return {
        id: p.id,
        last_name: p.last_name,
        first_name: p.first_name,
        gp: playerRows.length,
        starts: playerRows.filter((r) => r.starter).length,
        fouled_out: playerRows.filter((r) => r.fouls >= 5).length,
        averages: {
          time_played: formatAvgTime(playerRows),
          points: avg(playerRows, (r) => r.points),
          shots_made: avg(playerRows, (r) => r.shots_made),
          three_pts_made: avg(playerRows, (r) => r.three_pts_made),
          two_pts_in_made: avg(playerRows, (r) => r.two_pts_in_made),
          two_pts_out_made: avg(playerRows, (r) => r.two_pts_out_made),
          ft_made: avg(playerRows, (r) => r.ft_made),
          fouls: avg(playerRows, (r) => r.fouls),
        },
      };
    });

    return {
      id: team.id,
      name: team.suffix ? `${team.name} ${team.suffix}` : team.name,
      category: team.category,
      gender: team.gender,
      games_played,
      championships,
      players,
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
