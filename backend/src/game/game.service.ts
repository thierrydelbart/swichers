import * as fs from 'fs/promises';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Game } from './game.entity';
import { File } from '../file/file.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { TeamStatRow } from '../team-stat-row/team-stat-row.entity';
import { CoachStatRow } from '../coach-stat-row/coach-stat-row.entity';
import { GameOfficer } from '../game-officer/game-officer.entity';
import { GameOfficerRole } from '../game-officer/game-officer-role.enum';
import { TeamStatType } from '../team-stat-row/team-stat-type.enum';

function formatDate(day: Date | string): string {
  const str = typeof day === 'string' ? day : day.toISOString().slice(0, 10);
  const [yyyy, mm, dd] = str.slice(0, 10).split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTimePlayed(seconds: number | null): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function mapPlayer(row: PlayerStatRow) {
  return {
    number: row.number,
    last_name: row.player.last_name,
    first_name: row.player.first_name,
    starter: row.starter,
    time_played: formatTimePlayed(row.time_played),
    points: row.points,
    shots_made: row.shots_made,
    three_pts_made: row.three_pts_made,
    two_pts_in_made: row.two_pts_in_made,
    two_pts_out_made: row.two_pts_out_made,
    ft_made: row.ft_made,
    fouls: row.fouls,
  };
}

function mapTotals(rows: TeamStatRow[]) {
  const byType = Object.fromEntries(rows.map((r) => [r.type, r]));
  const mapRow = (type: TeamStatType) => {
    const r = byType[type];
    if (!r) return { points: 0, fouls: 0, three_pts_made: 0, ft_made: 0 };
    return {
      points: r.points ?? 0,
      fouls: r.fouls ?? 0,
      three_pts_made: r.three_pts_made ?? 0,
      ft_made: r.ft_made ?? 0,
    };
  };
  return {
    team: mapRow(TeamStatType.TEAM),
    starters: mapRow(TeamStatType.STARTERS),
    bench: mapRow(TeamStatType.BENCH),
    first_half: mapRow(TeamStatType.FIRST_HALF),
    second_half: mapRow(TeamStatType.SECOND_HALF),
    overtime: mapRow(TeamStatType.OVERTIME),
  };
}

export interface GameListItem {
  id: number;
  date: string;
  team_a: { id: number; name: string; suffix: string | null };
  team_b: { id: number; name: string; suffix: string | null };
  score_a: number;
  score_b: number;
  championship: string;
  file_id: number | null;
}

@Injectable()
export class GameService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Game) private readonly gameRepo: Repository<Game>,
    @InjectRepository(File) private readonly fileRepo: Repository<File>,
    @InjectRepository(PlayerStatRow)
    private readonly playerStatRowRepo: Repository<PlayerStatRow>,
    @InjectRepository(TeamStatRow)
    private readonly teamStatRowRepo: Repository<TeamStatRow>,
    @InjectRepository(CoachStatRow)
    private readonly coachStatRowRepo: Repository<CoachStatRow>,
    @InjectRepository(GameOfficer)
    private readonly gameOfficerRepo: Repository<GameOfficer>,
  ) {}

  async findOne(id: number): Promise<object> {
    const game = await this.gameRepo.findOne({
      where: { id },
      relations: [
        'venue',
        'group',
        'group.championship',
        'group.championship.league',
        'team_a',
        'team_a.club',
        'team_b',
        'team_b.club',
      ],
    });
    if (!game) throw new NotFoundException(`Game #${id} not found`);

    const [playerRows, teamStatRows, coachRows, officers, file] =
      await Promise.all([
        this.playerStatRowRepo.find({
          where: { game: { id } },
          relations: ['player', 'player.club'],
        }),
        this.teamStatRowRepo.find({
          where: { game: { id } },
          relations: ['team'],
        }),
        this.coachStatRowRepo.find({
          where: { game: { id } },
          relations: ['coach', 'coach.club'],
        }),
        this.gameOfficerRepo.find({
          where: { game: { id }, role: GameOfficerRole.REFEREE },
          relations: ['officer'],
          order: { rank: 'ASC' },
        }),
        this.fileRepo.findOne({ where: { game: { id } } }),
      ]);

    const homeClubId = game.team_a.club.id;
    const awayClubId = game.team_b.club.id;

    const homeCoach =
      coachRows.find((r) => r.coach.club.id === homeClubId) ?? null;
    const awayCoach =
      coachRows.find((r) => r.coach.club.id === awayClubId) ?? null;

    return {
      id: game.id,
      file_id: file?.id ?? null,
      game_number: game.game_number,
      date: formatDate(game.day),
      time: formatTime(game.time),
      venue: game.venue.name,
      group: game.group.name,
      championship: {
        name: game.group.championship.name,
        season: game.group.championship.season,
      },
      league: game.group.championship.league
        ? {
            code: game.group.championship.league.code,
            name: game.group.championship.league.name,
          }
        : null,
      referees: officers.map((o) => o.officer.name),
      home: {
        team_id: game.team_a.id,
        name: game.team_a.suffix
          ? `${game.team_a.name} ${game.team_a.suffix}`
          : game.team_a.name,
        players: playerRows
          .filter((r) => r.player.club.id === homeClubId)
          .map(mapPlayer),
        totals: mapTotals(
          teamStatRows.filter((r) => r.team.id === game.team_a.id),
        ),
        coach: homeCoach
          ? {
              name: `${homeCoach.coach.last_name} ${homeCoach.coach.first_name}`,
              fouls: homeCoach.fouls,
            }
          : null,
      },
      away: {
        team_id: game.team_b.id,
        name: game.team_b.suffix
          ? `${game.team_b.name} ${game.team_b.suffix}`
          : game.team_b.name,
        players: playerRows
          .filter((r) => r.player.club.id === awayClubId)
          .map(mapPlayer),
        totals: mapTotals(
          teamStatRows.filter((r) => r.team.id === game.team_b.id),
        ),
        coach: awayCoach
          ? {
              name: `${awayCoach.coach.last_name} ${awayCoach.coach.first_name}`,
              fouls: awayCoach.fouls,
            }
          : null,
      },
    };
  }

  async list(search: string | undefined, page: number) {
    const pageSize = 20;
    const qb = this.gameRepo
      .createQueryBuilder('game')
      .innerJoinAndSelect('game.team_a', 'ta')
      .innerJoinAndSelect('game.team_b', 'tb')
      .innerJoinAndSelect('game.group', 'grp')
      .innerJoinAndSelect('grp.championship', 'champ')
      .orderBy('game.day', 'DESC')
      .addOrderBy('game.id', 'DESC');

    if (search?.trim()) {
      qb.where('ta.name ILIKE :q OR tb.name ILIKE :q', {
        q: `%${search.trim()}%`,
      });
    }

    const [rows, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const gameIds = rows.map((g) => g.id);
    const files =
      gameIds.length > 0
        ? await this.fileRepo.find({
            where: { game: { id: In(gameIds) } },
            relations: ['game'],
          })
        : [];
    const fileByGame = new Map(files.map((f) => [f.game.id, f.id]));

    const data: GameListItem[] = rows.map((g) => ({
      id: g.id,
      date: formatDate(g.day),
      team_a: { id: g.team_a.id, name: g.team_a.name, suffix: g.team_a.suffix },
      team_b: { id: g.team_b.id, name: g.team_b.name, suffix: g.team_b.suffix },
      score_a: g.score_a,
      score_b: g.score_b,
      championship: `${g.group.championship.name} · ${g.group.championship.season}`,
      file_id: fileByGame.get(g.id) ?? null,
    }));

    return { data, total, page, pageSize };
  }

  async delete(id: number): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const game = await em.findOne(Game, { where: { id } });
      if (!game) throw new NotFoundException(`Game #${id} not found`);

      const files = await em.find(File, { where: { game: { id } } });

      await em.delete(GameOfficer, { game: { id } });
      await em.delete(PlayerStatRow, { game: { id } });
      await em.delete(CoachStatRow, { game: { id } });
      await em.delete(TeamStatRow, { game: { id } });

      for (const file of files) {
        await em.delete(File, { id: file.id });
        await fs.unlink(file.location).catch(() => {});
      }

      await em.delete(Game, { id });
    });
  }
}
