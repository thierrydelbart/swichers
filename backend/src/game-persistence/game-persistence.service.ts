import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ChampionshipService } from '../championship/championship.service';
import { LeagueService } from '../league/league.service';
import { ClubService } from '../club/club.service';
import { CoachService } from '../coach/coach.service';
import { GroupService } from '../group/group.service';
import { OfficerService } from '../officer/officer.service';
import { PlayerService } from '../player/player.service';
import { TeamService } from '../team/team.service';
import { VenueService } from '../venue/venue.service';
import { Championship } from '../championship/championship.entity';
import { Club } from '../club/club.entity';
import { File } from '../file/file.entity';
import { Game } from '../game/game.entity';
import { GameOfficer } from '../game-officer/game-officer.entity';
import { GameOfficerRole } from '../game-officer/game-officer-role.enum';
import { Group } from '../group/group.entity';
import { CoachStatRow } from '../coach-stat-row/coach-stat-row.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { Team } from '../team/team.entity';
import { TeamStatRow } from '../team-stat-row/team-stat-row.entity';
import { TeamStatType } from '../team-stat-row/team-stat-type.enum';
import { Venue } from '../venue/venue.entity';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { ExtractionResult, StatRow } from './extraction-result.interface';

export interface GameReferences {
  championship: Championship;
  group: Group;
  venue: Venue;
  homeClub: Club;
  awayClub: Club;
  homeTeam: Team;
  awayTeam: Team;
}

function parseDate(dateStr: string): Date {
  const [d, m, y] = dateStr.split('/').map(Number);
  return new Date(2000 + y, m - 1, d);
}

function parseTime(timeStr: string): number {
  const [h, min] = timeStr.split(':').map(Number);
  return h * 60 + min;
}

function parseTimePlayed(timeStr: string | null): number {
  if (!timeStr) return 0;
  const [m, s] = timeStr.split(':').map(Number);
  return m * 60 + s;
}

function parseTimePlayedNullable(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const [m, s] = timeStr.split(':').map(Number);
  return m * 60 + s;
}

@Injectable()
export class GamePersistenceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly leagueService: LeagueService,
    private readonly championshipService: ChampionshipService,
    private readonly groupService: GroupService,
    private readonly venueService: VenueService,
    private readonly clubService: ClubService,
    private readonly teamService: TeamService,
    private readonly officerService: OfficerService,
    private readonly playerService: PlayerService,
    private readonly coachService: CoachService,
  ) {}

  async resolveReferences(
    data: ExtractionResult,
    fileName: string,
  ): Promise<GameReferences> {
    const { competition, teams, game_info } = data;

    const match = /^resume_(\d+)_/i.exec(fileName);
    const code = match?.[1] ?? null;
    if (!code || code !== '0034') {
      throw new BadRequestException('Unsupported league');
    }

    const league = await this.leagueService.findOrCreate(code);

    const category =
      (competition.category as TeamCategory) ?? TeamCategory.SENIOR;
    const gender = (competition.gender as Gender) ?? Gender.MALE;

    const championship = await this.championshipService.findOrCreate(
      competition.name,
      competition.season,
      competition.short_code,
      category,
      gender,
      league,
    );

    const [group, venue, homeClub, awayClub] = await Promise.all([
      this.groupService.findOrCreate(game_info.group, championship),
      this.venueService.findOrCreate(game_info.venue),
      this.clubService.findOrCreate(teams.home.name),
      this.clubService.findOrCreate(teams.away.name),
    ]);

    const [homeTeam, awayTeam] = await Promise.all([
      this.teamService.findOrCreate(
        teams.home.name,
        teams.home.suffix,
        category,
        gender,
        homeClub,
      ),
      this.teamService.findOrCreate(
        teams.away.name,
        teams.away.suffix,
        category,
        gender,
        awayClub,
      ),
    ]);

    return {
      championship,
      group,
      venue,
      homeClub,
      awayClub,
      homeTeam,
      awayTeam,
    };
  }

  async persist(data: ExtractionResult, file: File): Promise<Game> {
    const refs = await this.resolveReferences(data, file.name);

    return this.dataSource.transaction(async (em) => {
      const gameNumber = String(data.game_info.game_number);

      const existing = await em.findOne(Game, {
        where: { game_number: gameNumber, group: { id: refs.group.id } },
      });

      if (existing) {
        await Promise.all([
          em.delete(GameOfficer, { game: { id: existing.id } }),
          em.delete(PlayerStatRow, { game: { id: existing.id } }),
          em.delete(CoachStatRow, { game: { id: existing.id } }),
          em.delete(TeamStatRow, { game: { id: existing.id } }),
        ]);
      }

      const gameData = {
        game_number: gameNumber,
        day: parseDate(data.game_info.date),
        time: parseTime(data.game_info.time),
        venue: refs.venue,
        group: refs.group,
        team_a: refs.homeTeam,
        team_b: refs.awayTeam,
        score_a: data.stats.home.totals.team.points,
        score_b: data.stats.away.totals.team.points,
        blog_title: data.blog_post?.title,
        blog_content: data.blog_post?.content,
      };

      const game = (await em.save(
        existing
          ? em.merge(Game, existing, gameData)
          : em.create(Game, gameData),
      )) as Game;

      for (const [name, rank] of (
        [
          [data.game_info.referees.first, 1],
          [data.game_info.referees.second, 2],
          [data.game_info.referees.third, 3],
        ] as [string | null, number][]
      ).filter(([n]) => n !== null)) {
        const officer = await this.officerService.findOrCreate(name as string);
        await em.save(
          em.create(GameOfficer, {
            game,
            officer,
            role: GameOfficerRole.REFEREE,
            rank,
          }),
        );
      }

      for (const { sideStats, club, team } of [
        {
          sideStats: data.stats.home,
          club: refs.homeClub,
          team: refs.homeTeam,
        },
        {
          sideStats: data.stats.away,
          club: refs.awayClub,
          team: refs.awayTeam,
        },
      ]) {
        for (const p of sideStats.players) {
          const player = await this.playerService.findOrCreate(
            p.last_name,
            p.first_name,
            club,
          );
          await em.save(
            em.create(PlayerStatRow, {
              game,
              player,
              number: p.number,
              starter: p.starter,
              time_played: parseTimePlayed(p.time_played),
              points: p.points,
              shots_made: p.shots_made,
              three_pts_made: p['3pts_made'],
              two_pts_in_made: p['2pts_in_made'],
              two_pts_out_made: p['2pts_out_made'],
              ft_made: p.FT_made,
              fouls: p.fouls,
            }),
          );
        }

        if (sideStats.coach.name) {
          const parts = sideStats.coach.name.split(' ');
          const coach = await this.coachService.findOrCreate(
            parts[0],
            parts.slice(1).join(' '),
            club,
          );
          await em.save(
            em.create(CoachStatRow, {
              game,
              coach,
              fouls: sideStats.coach.fouls,
            }),
          );
        }

        for (const [type, row] of Object.entries(sideStats.totals) as [
          string,
          StatRow,
        ][]) {
          await em.save(
            em.create(TeamStatRow, {
              game,
              team,
              type: type as TeamStatType,
              time_played: parseTimePlayedNullable(row.time_played),
              points: row.points,
              shots_made: row.shots_made,
              three_pts_made: row['3pts_made'],
              two_pts_in_made: row['2pts_in_made'],
              two_pts_out_made: row['2pts_out_made'],
              ft_made: row.FT_made,
              fouls: row.fouls,
            }),
          );
        }
      }

      await em.update(File, file.id, { game });

      return game;
    });
  }
}
