/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { TeamStatRow } from '../team-stat-row/team-stat-row.entity';
import { CoachStatRow } from '../coach-stat-row/coach-stat-row.entity';
import { GameOfficer } from '../game-officer/game-officer.entity';
import { TeamStatType } from '../team-stat-row/team-stat-type.enum';
import { GameOfficerRole } from '../game-officer/game-officer-role.enum';

const mockGame = {
  id: 1,
  game_number: '42',
  day: new Date('2025-11-15T00:00:00.000Z'),
  time: 1230,
  venue: { id: 1, name: 'Salle des Sports' },
  group: {
    id: 1,
    name: 'Poule A',
    championship: { id: 1, name: 'Pré Régionale Masculine', season: '2025/26' },
  },
  team_a: { id: 1, name: 'CLAPIERS', suffix: '1', club: { id: 1 } },
  team_b: { id: 2, name: 'MONTPELLIER', suffix: null, club: { id: 2 } },
};

const mockPlayerRows = [
  {
    number: 5,
    starter: true,
    time_played: 1694,
    points: 18,
    shots_made: 7,
    three_pts_made: 2,
    two_pts_in_made: 2,
    two_pts_out_made: 1,
    ft_made: 2,
    fouls: 3,
    player: { last_name: 'BERNARD', first_name: 'Antoine', club: { id: 1 } },
  },
  {
    number: 10,
    starter: true,
    time_played: 1860,
    points: 20,
    shots_made: 8,
    three_pts_made: 2,
    two_pts_in_made: 3,
    two_pts_out_made: 1,
    ft_made: 2,
    fouls: 2,
    player: { last_name: 'SIMON', first_name: 'Julien', club: { id: 2 } },
  },
];

const makeTeamStat = (
  type: TeamStatType,
  teamId: number,
  points: number,
  fouls: number,
  three: number,
  ft: number,
) => ({
  type,
  team: { id: teamId },
  points,
  fouls,
  three_pts_made: three,
  ft_made: ft,
  time_played: null,
  shots_made: null,
  two_pts_in_made: null,
  two_pts_out_made: null,
});

const mockTeamStats = [
  makeTeamStat(TeamStatType.TEAM, 1, 74, 13, 6, 10),
  makeTeamStat(TeamStatType.TEAM, 2, 61, 14, 5, 8),
  makeTeamStat(TeamStatType.STARTERS, 1, 64, 12, 5, 8),
  makeTeamStat(TeamStatType.STARTERS, 2, 58, 12, 4, 8),
  makeTeamStat(TeamStatType.BENCH, 1, 10, 1, 1, 2),
  makeTeamStat(TeamStatType.BENCH, 2, 3, 2, 1, 0),
  makeTeamStat(TeamStatType.FIRST_HALF, 1, 38, 6, 3, 4),
  makeTeamStat(TeamStatType.FIRST_HALF, 2, 29, 7, 2, 3),
  makeTeamStat(TeamStatType.SECOND_HALF, 1, 36, 7, 3, 6),
  makeTeamStat(TeamStatType.SECOND_HALF, 2, 32, 7, 3, 5),
  makeTeamStat(TeamStatType.OVERTIME, 1, 0, 0, 0, 0),
  makeTeamStat(TeamStatType.OVERTIME, 2, 0, 0, 0, 0),
];

const mockCoachRows = [
  {
    fouls: 0,
    coach: { last_name: 'DUPONT', first_name: 'Jean', club: { id: 1 } },
  },
];

const mockOfficers = [
  { rank: 1, officer: { name: 'DUPONT Jean' }, role: GameOfficerRole.REFEREE },
  { rank: 2, officer: { name: 'MARTIN Paul' }, role: GameOfficerRole.REFEREE },
];

describe('GameService', () => {
  let service: GameService;
  let gameRepo: { findOne: jest.Mock };
  let playerStatRowRepo: { find: jest.Mock };
  let teamStatRowRepo: { find: jest.Mock };
  let coachStatRowRepo: { find: jest.Mock };
  let gameOfficerRepo: { find: jest.Mock };

  beforeEach(async () => {
    gameRepo = { findOne: jest.fn() };
    playerStatRowRepo = { find: jest.fn() };
    teamStatRowRepo = { find: jest.fn() };
    coachStatRowRepo = { find: jest.fn() };
    gameOfficerRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: getRepositoryToken(Game), useValue: gameRepo },
        {
          provide: getRepositoryToken(PlayerStatRow),
          useValue: playerStatRowRepo,
        },
        { provide: getRepositoryToken(TeamStatRow), useValue: teamStatRowRepo },
        {
          provide: getRepositoryToken(CoachStatRow),
          useValue: coachStatRowRepo,
        },
        { provide: getRepositoryToken(GameOfficer), useValue: gameOfficerRepo },
      ],
    }).compile();
    service = module.get<GameService>(GameService);
  });

  it('throws NotFoundException for unknown id', async () => {
    gameRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('returns full game data', async () => {
    gameRepo.findOne.mockResolvedValue(mockGame);
    playerStatRowRepo.find.mockResolvedValue(mockPlayerRows);
    teamStatRowRepo.find.mockResolvedValue(mockTeamStats);
    coachStatRowRepo.find.mockResolvedValue(mockCoachRows);
    gameOfficerRepo.find.mockResolvedValue(mockOfficers);

    const result: any = await service.findOne(1);

    expect(result.game_number).toBe('42');
    expect(result.date).toBe('15/11/2025');
    expect(result.time).toBe('20:30');
    expect(result.championship).toEqual({
      name: 'Pré Régionale Masculine',
      season: '2025/26',
    });
    expect(result.referees).toEqual(['DUPONT Jean', 'MARTIN Paul']);

    expect(result.home.name).toBe('CLAPIERS');
    expect(result.home.suffix).toBe('1');
    expect(result.home.players).toHaveLength(1);
    expect(result.home.players[0].last_name).toBe('BERNARD');
    expect(result.home.players[0].time_played).toBe('28:14');
    expect(result.home.totals.team).toEqual({
      points: 74,
      fouls: 13,
      three_pts_made: 6,
      ft_made: 10,
    });
    expect(result.home.coach).toEqual({ name: 'DUPONT Jean', fouls: 0 });

    expect(result.away.name).toBe('MONTPELLIER');
    expect(result.away.suffix).toBeNull();
    expect(result.away.players).toHaveLength(1);
    expect(result.away.players[0].last_name).toBe('SIMON');
    expect(result.away.totals.team).toEqual({
      points: 61,
      fouls: 14,
      three_pts_made: 5,
      ft_made: 8,
    });
    expect(result.away.coach).toBeNull();
  });

  it('returns null time_played for 0 seconds', async () => {
    const rowsWithZero = [{ ...mockPlayerRows[0], time_played: 0 }];
    gameRepo.findOne.mockResolvedValue(mockGame);
    playerStatRowRepo.find.mockResolvedValue(rowsWithZero);
    teamStatRowRepo.find.mockResolvedValue([]);
    coachStatRowRepo.find.mockResolvedValue([]);
    gameOfficerRepo.find.mockResolvedValue([]);

    const result: any = await service.findOne(1);
    expect(result.home.players[0].time_played).toBeNull();
  });
});
