/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from './team.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { TeamStatRow } from '../team-stat-row/team-stat-row.entity';
import { Club } from '../club/club.entity';
import { TeamCategory } from '../shared/team-category.enum';
import { Gender } from '../shared/gender.enum';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const mockQb = {
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};
const mockPsrRepo = { createQueryBuilder: jest.fn(() => mockQb) };
const mockTsrQb = {
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};
const mockTsrRepo = { createQueryBuilder: jest.fn(() => mockTsrQb) };
const club = { id: 1, name: 'CLAPIERS' } as Club;

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPsrRepo.createQueryBuilder.mockReturnValue(mockQb);
    mockQb.getMany.mockResolvedValue([]);
    mockTsrRepo.createQueryBuilder.mockReturnValue(mockTsrQb);
    mockTsrQb.getMany.mockResolvedValue([]);
    const module = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: getRepositoryToken(Team), useValue: mockRepo },
        { provide: getRepositoryToken(PlayerStatRow), useValue: mockPsrRepo },
        { provide: getRepositoryToken(TeamStatRow), useValue: mockTsrRepo },
      ],
    }).compile();
    service = module.get(TeamService);
  });

  it('findOne returns team data with aggregations', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'CLAPIERS',
      suffix: '1',
      category: TeamCategory.SENIOR,
      gender: Gender.MALE,
      club,
    });
    const champ = { name: 'Pré Régionale', season: '2025/26' };
    const grp = { championship: champ };
    mockQb.getMany.mockResolvedValue([
      {
        player: { id: 10, last_name: 'BERNARD', first_name: 'Antoine', club },
        game: { id: 1, group: grp },
        starter: true,
        time_played: 1680,
        points: 18,
        shots_made: 7,
        three_pts_made: 2,
        two_pts_in_made: 2,
        two_pts_out_made: 1,
        ft_made: 2,
        fouls: 2,
      },
      {
        player: { id: 10, last_name: 'BERNARD', first_name: 'Antoine', club },
        game: { id: 2, group: grp },
        starter: false,
        time_played: 1200,
        points: 12,
        shots_made: 5,
        three_pts_made: 1,
        two_pts_in_made: 2,
        two_pts_out_made: 1,
        ft_made: 2,
        fouls: 5,
      },
    ]);

    const result: any = await service.findOne(1);
    expect(result.name).toBe('CLAPIERS 1');
    expect(result.games_played).toBe(2);
    expect(result.championships).toEqual(['Pré Régionale 2025/26']);
    expect(result.players).toHaveLength(1);
    const p = result.players[0];
    expect(p.gp).toBe(2);
    expect(p.starts).toBe(1);
    expect(p.fouled_out).toBe(1);
    expect(p.averages.points).toBe(15.0);
    expect(p.averages.time_played).toBe('24:00');
    expect(p.totals.points).toBe(30);
    expect(p.totals.time_played).toBe('48:00');
  });

  it('findOne returns games list', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'CLAPIERS',
      suffix: '1',
      category: TeamCategory.SENIOR,
      gender: Gender.MALE,
      club,
    });
    const game = {
      id: 1,
      game_number: '42',
      day: '2025-11-15',
      team_a: { id: 1, name: 'CLAPIERS', suffix: '1' },
      team_b: { id: 2, name: 'MONTPELLIER EST BASKET', suffix: null },
    };
    mockTsrQb.getMany.mockResolvedValue([
      {
        team: { id: 1 },
        game,
        points: 74,
        three_pts_made: 5,
        ft_made: 18,
        fouls: 11,
      },
      {
        team: { id: 2 },
        game,
        points: 61,
        three_pts_made: 3,
        ft_made: 10,
        fouls: 14,
      },
    ]);
    const result: any = await service.findOne(1);
    expect(result.games).toHaveLength(1);
    const g = result.games[0];
    expect(g.opponent).toBe('MONTPELLIER EST BASKET');
    expect(g.home).toBe(true);
    expect(g.points).toBe(74);
    expect(g.points_against).toBe(61);
    expect(g.date).toBe('15/11/2025');
  });

  it('findOne throws NotFoundException for unknown id', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('returns existing team', async () => {
    const team = {
      id: 1,
      name: 'CLAPIERS BASKET BALL',
      suffix: '1',
      category: TeamCategory.U11,
      gender: Gender.MALE,
      club,
    };
    mockRepo.findOne.mockResolvedValue(team);
    expect(
      await service.findOrCreate(
        'CLAPIERS BASKET BALL',
        '1',
        TeamCategory.U11,
        Gender.MALE,
        club,
      ),
    ).toEqual(team);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates team when not found', async () => {
    const team = {
      id: 1,
      name: 'CLAPIERS BASKET BALL',
      suffix: '1',
      category: TeamCategory.SENIOR,
      gender: Gender.MALE,
      club,
    };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(team);
    mockRepo.save.mockResolvedValue(team);
    expect(
      await service.findOrCreate(
        'CLAPIERS BASKET BALL',
        '1',
        TeamCategory.SENIOR,
        Gender.MALE,
        club,
      ),
    ).toEqual(team);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
