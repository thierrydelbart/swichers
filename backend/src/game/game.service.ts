import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
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

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepo: Repository<Game>,
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
        'team_a',
        'team_a.club',
        'team_b',
        'team_b.club',
      ],
    });
    if (!game) throw new NotFoundException(`Game #${id} not found`);

    const [playerRows, teamStatRows, coachRows, officers] = await Promise.all([
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
    ]);

    const homeClubId = game.team_a.club.id;
    const awayClubId = game.team_b.club.id;

    const homeCoach =
      coachRows.find((r) => r.coach.club.id === homeClubId) ?? null;
    const awayCoach =
      coachRows.find((r) => r.coach.club.id === awayClubId) ?? null;

    return {
      id: game.id,
      game_number: game.game_number,
      date: formatDate(game.day),
      time: formatTime(game.time),
      venue: game.venue.name,
      group: game.group.name,
      championship: {
        name: game.group.championship.name,
        season: game.group.championship.season,
      },
      referees: officers.map((o) => o.officer.name),
      home: {
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
}
