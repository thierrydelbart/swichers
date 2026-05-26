import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { Team } from './team.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { TeamStatRow } from '../team-stat-row/team-stat-row.entity';
import { TeamStatType } from '../team-stat-row/team-stat-type.enum';

function sum(rows: PlayerStatRow[], fn: (r: PlayerStatRow) => number): number {
  return rows.reduce((acc, r) => acc + fn(r), 0);
}

function avg(rows: PlayerStatRow[], fn: (r: PlayerStatRow) => number): number {
  return Math.round((sum(rows, fn) / rows.length) * 10) / 10;
}

function formatDate(day: Date | string): string {
  const str = typeof day === 'string' ? day : day.toISOString().slice(0, 10);
  const [yyyy, mm, dd] = str.slice(0, 10).split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatSeconds(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatAvgTime(rows: PlayerStatRow[]): string {
  return formatSeconds(
    Math.round(sum(rows, (r) => r.time_played) / rows.length),
  );
}

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
    @InjectRepository(PlayerStatRow)
    private readonly psrRepo: Repository<PlayerStatRow>,
    @InjectRepository(TeamStatRow)
    private readonly tsrRepo: Repository<TeamStatRow>,
  ) {}

  async findByClub(clubName: string): Promise<object[]> {
    const teams = await this.repo.find({
      where: { club: { name: clubName } },
      relations: ['club'],
      order: { category: 'DESC', name: 'ASC', suffix: 'ASC' },
    });
    return teams.map((t) => ({
      id: t.id,
      name: t.suffix ? `${t.name} ${t.suffix}` : t.name,
      suffix: t.suffix,
      category: t.category,
      gender: t.gender,
    }));
  }

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
      .leftJoinAndSelect('champ.league', 'league')
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
        totals: {
          time_played: formatSeconds(sum(playerRows, (r) => r.time_played)),
          points: sum(playerRows, (r) => r.points),
          shots_made: sum(playerRows, (r) => r.shots_made),
          three_pts_made: sum(playerRows, (r) => r.three_pts_made),
          two_pts_in_made: sum(playerRows, (r) => r.two_pts_in_made),
          two_pts_out_made: sum(playerRows, (r) => r.two_pts_out_made),
          ft_made: sum(playerRows, (r) => r.ft_made),
          fouls: sum(playerRows, (r) => r.fouls),
        },
      };
    });

    const tsrRows = await this.tsrRepo
      .createQueryBuilder('tsr')
      .innerJoinAndSelect('tsr.game', 'game')
      .innerJoinAndSelect('game.team_a', 'ta')
      .innerJoinAndSelect('game.team_b', 'tb')
      .innerJoinAndSelect('tsr.team', 'stat_team')
      .where('tsr.type = :type', { type: TeamStatType.TEAM })
      .andWhere('(ta.id = :teamId OR tb.id = :teamId)', { teamId: id })
      .orderBy('game.day', 'DESC')
      .addOrderBy('game.id', 'DESC')
      .getMany();

    const gameMap = new Map<
      number,
      {
        game: (typeof tsrRows)[0]['game'];
        mine: (typeof tsrRows)[0] | null;
      }
    >();
    for (const row of tsrRows) {
      const gid = row.game.id;
      if (!gameMap.has(gid)) gameMap.set(gid, { game: row.game, mine: null });
      const entry = gameMap.get(gid)!;
      if (row.team.id === id) entry.mine = row;
    }

    const games = [...gameMap.values()].map(({ game, mine }) => {
      const home = game.team_a.id === id;
      const opp = home ? game.team_b : game.team_a;
      const points = home ? game.score_a : game.score_b;
      const points_against = home ? game.score_b : game.score_a;
      return {
        id: game.id,
        game_number: game.game_number,
        date: formatDate(game.day),
        opponent: opp.suffix ? `${opp.name} ${opp.suffix}` : opp.name,
        home,
        points,
        points_against,
        win: points && points_against && points > points_against,
        three_pts_made: mine?.three_pts_made ?? 0,
        ft_made: mine?.ft_made ?? 0,
        fouls: mine?.fouls ?? 0,
      };
    });

    return {
      id: team.id,
      name: team.suffix ? `${team.name} ${team.suffix}` : team.name,
      category: team.category,
      gender: team.gender,
      games_played,
      championships,
      league: rows[0]?.game.group.championship.league
        ? {
            code: rows[0].game.group.championship.league.code,
            name: rows[0].game.group.championship.league.name,
          }
        : null,
      players,
      games,
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
