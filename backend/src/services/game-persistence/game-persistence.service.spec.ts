import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { GamePersistenceService } from './game-persistence.service';
import { ChampionshipService } from '@entities/championship/championship.service';
import { GroupService } from '@entities/group/group.service';
import { VenueService } from '@entities/venue/venue.service';
import { ClubService } from '@entities/club/club.service';
import { TeamService } from '@entities/team/team.service';
import { OfficerService } from '@entities/officer/officer.service';
import { PlayerService } from '@entities/player/player.service';
import { CoachService } from '@entities/coach/coach.service';
import { LeagueService } from '@entities/league/league.service';
import { ExtractionResult } from './extraction-result.interface';
import { BadRequestException } from '@nestjs/common';
import { Gender } from '@shared/gender.enum';
import { TeamCategory } from '@shared/team-category.enum';

const mockLeagueService = { findOrCreate: jest.fn() };
const mockChampionshipService = { findOrCreate: jest.fn() };
const mockGroupService = { findOrCreate: jest.fn() };
const mockVenueService = { findOrCreate: jest.fn() };
const mockClubService = { findOrCreate: jest.fn() };
const mockTeamService = { findOrCreate: jest.fn() };
const mockOfficerService = { findOrCreate: jest.fn() };
const mockPlayerService = { findOrCreate: jest.fn() };
const mockCoachService = { findOrCreate: jest.fn() };

const mockEm = {
  findOne: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  merge: jest.fn(),
  update: jest.fn(),
};

const mockDataSource = {
  transaction: jest
    .fn()
    .mockImplementation((cb: (em: typeof mockEm) => unknown) => cb(mockEm)),
};

const extraction: ExtractionResult = {
  competition: {
    name: 'Pré régionale masculine',
    short_code: 'PRM',
    season: '2025/26',
    category: 'Senior',
    gender: 'Male',
  },
  teams: {
    home: { name: 'CLAPIERS BASKET BALL', suffix: '1' },
    away: { name: 'MONTPELLIER UC', suffix: null },
  },
  game_info: {
    game_number: 42,
    date: '15/11/25',
    time: '20:00',
    venue: 'Salle des sports',
    group: 'Poule A',
    referees: { first: 'REF1', second: 'REF2', third: null },
  },
  stats: {
    home: {
      players: [
        {
          number: 7,
          last_name: 'MARTIN',
          first_name: 'Paul',
          starter: true,
          time_played: '32:00',
          points: 12,
          shots_made: 5,
          '3pts_made': 2,
          '2pts_in_made': 1,
          '2pts_out_made': 0,
          FT_made: 2,
          fouls: 3,
        },
      ],
      totals: {
        team: {
          time_played: '200:00',
          points: 80,
          shots_made: 30,
          '3pts_made': 8,
          '2pts_in_made': 10,
          '2pts_out_made': 4,
          FT_made: 10,
          fouls: 20,
        },
        bench: {
          time_played: '100:00',
          points: 40,
          shots_made: 15,
          '3pts_made': 4,
          '2pts_in_made': 5,
          '2pts_out_made': 2,
          FT_made: 5,
          fouls: 10,
        },
        starters: {
          time_played: '100:00',
          points: 40,
          shots_made: 15,
          '3pts_made': 4,
          '2pts_in_made': 5,
          '2pts_out_made': 2,
          FT_made: 5,
          fouls: 10,
        },
        first_half: {
          time_played: null,
          points: 40,
          shots_made: 15,
          '3pts_made': 4,
          '2pts_in_made': 5,
          '2pts_out_made': 2,
          FT_made: 5,
          fouls: 10,
        },
        second_half: {
          time_played: null,
          points: 40,
          shots_made: 15,
          '3pts_made': 4,
          '2pts_in_made': 5,
          '2pts_out_made': 2,
          FT_made: 5,
          fouls: 10,
        },
        overtime: {
          time_played: null,
          points: 0,
          shots_made: 0,
          '3pts_made': 0,
          '2pts_in_made': 0,
          '2pts_out_made': 0,
          FT_made: 0,
          fouls: 0,
        },
      },
      coach: { name: 'DUPONT Jean', fouls: 0 },
    },
    away: {
      players: [],
      totals: {
        team: {
          time_played: '200:00',
          points: 70,
          shots_made: 28,
          '3pts_made': 6,
          '2pts_in_made': 8,
          '2pts_out_made': 4,
          FT_made: 8,
          fouls: 18,
        },
        bench: {
          time_played: '100:00',
          points: 35,
          shots_made: 14,
          '3pts_made': 3,
          '2pts_in_made': 4,
          '2pts_out_made': 2,
          FT_made: 4,
          fouls: 9,
        },
        starters: {
          time_played: '100:00',
          points: 35,
          shots_made: 14,
          '3pts_made': 3,
          '2pts_in_made': 4,
          '2pts_out_made': 2,
          FT_made: 4,
          fouls: 9,
        },
        first_half: {
          time_played: null,
          points: 35,
          shots_made: 14,
          '3pts_made': 3,
          '2pts_in_made': 4,
          '2pts_out_made': 2,
          FT_made: 4,
          fouls: 9,
        },
        second_half: {
          time_played: null,
          points: 35,
          shots_made: 14,
          '3pts_made': 3,
          '2pts_in_made': 4,
          '2pts_out_made': 2,
          FT_made: 4,
          fouls: 9,
        },
        overtime: {
          time_played: null,
          points: 0,
          shots_made: 0,
          '3pts_made': 0,
          '2pts_in_made': 0,
          '2pts_out_made': 0,
          FT_made: 0,
          fouls: 0,
        },
      },
      coach: { name: null, fouls: 0 },
    },
  },
  warnings: [],
};

const file = { id: 10, name: 'resume_0034_PRM_A_77.pdf' } as never;

describe('GamePersistenceService', () => {
  let service: GamePersistenceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEm.create.mockImplementation((_entity: unknown, data: unknown) => data);
    mockEm.merge.mockImplementation(
      (_entity: unknown, target: unknown, data: unknown) => ({
        ...(target as object),
        ...(data as object),
      }),
    );
    mockEm.save.mockImplementation((entity: unknown) =>
      Promise.resolve(entity),
    );
    mockEm.delete.mockResolvedValue(undefined);
    mockEm.update.mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        GamePersistenceService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: LeagueService, useValue: mockLeagueService },
        { provide: ChampionshipService, useValue: mockChampionshipService },
        { provide: GroupService, useValue: mockGroupService },
        { provide: VenueService, useValue: mockVenueService },
        { provide: ClubService, useValue: mockClubService },
        { provide: TeamService, useValue: mockTeamService },
        { provide: OfficerService, useValue: mockOfficerService },
        { provide: PlayerService, useValue: mockPlayerService },
        { provide: CoachService, useValue: mockCoachService },
      ],
    }).compile();
    service = module.get(GamePersistenceService);
  });

  describe('resolveReferences', () => {
    const fileName = 'resume_0034_PRM_A_77.pdf';

    it('resolves all references', async () => {
      const league = { id: 1, code: '0034' };
      const championship = { id: 1, name: 'Pré régionale masculine' };
      const group = { id: 1, name: 'Poule A' };
      const venue = { id: 1, name: 'Salle des sports' };
      const homeClub = { id: 1, name: 'CLAPIERS BASKET BALL' };
      const awayClub = { id: 2, name: 'MONTPELLIER UC' };
      const homeTeam = { id: 1, name: 'CLAPIERS BASKET BALL', suffix: '1' };
      const awayTeam = { id: 2, name: 'MONTPELLIER UC', suffix: null };

      mockLeagueService.findOrCreate.mockResolvedValue(league);
      mockChampionshipService.findOrCreate.mockResolvedValue(championship);
      mockGroupService.findOrCreate.mockResolvedValue(group);
      mockVenueService.findOrCreate.mockResolvedValue(venue);
      mockClubService.findOrCreate
        .mockResolvedValueOnce(homeClub)
        .mockResolvedValueOnce(awayClub);
      mockTeamService.findOrCreate
        .mockResolvedValueOnce(homeTeam)
        .mockResolvedValueOnce(awayTeam);

      const refs = await service.resolveReferences(extraction, fileName);

      expect(refs).toEqual({
        championship,
        group,
        venue,
        homeClub,
        awayClub,
        homeTeam,
        awayTeam,
      });
      expect(mockLeagueService.findOrCreate).toHaveBeenCalledWith('0034');
      expect(mockChampionshipService.findOrCreate).toHaveBeenCalledWith(
        'Pré régionale masculine',
        '2025/26',
        'PRM',
        TeamCategory.SENIOR,
        Gender.MALE,
        league,
      );
      expect(mockGroupService.findOrCreate).toHaveBeenCalledWith(
        'Poule A',
        championship,
      );
      expect(mockVenueService.findOrCreate).toHaveBeenCalledWith(
        'Salle des sports',
      );
      expect(mockTeamService.findOrCreate).toHaveBeenCalledWith(
        'CLAPIERS BASKET BALL',
        '1',
        TeamCategory.SENIOR,
        Gender.MALE,
        homeClub,
      );
      expect(mockTeamService.findOrCreate).toHaveBeenCalledWith(
        'MONTPELLIER UC',
        null,
        TeamCategory.SENIOR,
        Gender.MALE,
        awayClub,
      );
    });

    it('throws BadRequestException for unsupported league code', async () => {
      await expect(
        service.resolveReferences(extraction, 'resume_0099_PRM_A_77.pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when filename has no league code', async () => {
      await expect(
        service.resolveReferences(extraction, 'unknown_file.pdf'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('persist', () => {
    function seedRefs() {
      const championship = { id: 1 };
      const group = { id: 2 };
      const venue = { id: 3 };
      const homeClub = { id: 4 };
      const awayClub = { id: 5 };
      const homeTeam = { id: 6 };
      const awayTeam = { id: 7 };
      mockLeagueService.findOrCreate.mockResolvedValue({ id: 1, code: '0034' });
      mockChampionshipService.findOrCreate.mockResolvedValue(championship);
      mockGroupService.findOrCreate.mockResolvedValue(group);
      mockVenueService.findOrCreate.mockResolvedValue(venue);
      mockClubService.findOrCreate
        .mockResolvedValueOnce(homeClub)
        .mockResolvedValueOnce(awayClub);
      mockTeamService.findOrCreate
        .mockResolvedValueOnce(homeTeam)
        .mockResolvedValueOnce(awayTeam);
      mockOfficerService.findOrCreate.mockResolvedValue({ id: 10 });
      mockPlayerService.findOrCreate.mockResolvedValue({ id: 20 });
      mockCoachService.findOrCreate.mockResolvedValue({ id: 30 });
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

    it('creates a new game when none exists', async () => {
      seedRefs();
      mockEm.findOne.mockResolvedValue(null);
      const game = { id: 99, game_number: '42' };
      mockEm.save.mockResolvedValueOnce(game);

      const result = await service.persist(extraction, file);

      expect(result).toEqual(game);
      expect(mockEm.delete).not.toHaveBeenCalled();
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('deletes child rows and merges when game already exists', async () => {
      seedRefs();
      const existing = { id: 99, game_number: '42' };
      mockEm.findOne.mockResolvedValue(existing);
      mockEm.save.mockResolvedValueOnce(existing);

      await service.persist(extraction, file);

      expect(mockEm.delete).toHaveBeenCalledTimes(4);
      expect(mockEm.merge).toHaveBeenCalled();
    });

    it('links file to game', async () => {
      seedRefs();
      mockEm.findOne.mockResolvedValue(null);
      const game = { id: 99 };
      mockEm.save.mockResolvedValueOnce(game);

      await service.persist(extraction, file);

      expect(mockEm.update).toHaveBeenCalledWith(expect.anything(), 10, {
        game,
      });
    });

    it('only creates officers for non-null referees', async () => {
      seedRefs();
      mockEm.findOne.mockResolvedValue(null);
      mockEm.save.mockResolvedValueOnce({ id: 99 });

      await service.persist(extraction, file);

      // extraction has first + second referees, third is null → 2 officers
      expect(mockOfficerService.findOrCreate).toHaveBeenCalledTimes(2);
    });

    it('skips coach row when coach name is null', async () => {
      seedRefs();
      mockEm.findOne.mockResolvedValue(null);
      mockEm.save.mockResolvedValueOnce({ id: 99 });

      await service.persist(extraction, file);

      // only home team has a coach name in the fixture
      expect(mockCoachService.findOrCreate).toHaveBeenCalledTimes(1);
      expect(mockCoachService.findOrCreate).toHaveBeenCalledWith(
        'DUPONT',
        'Jean',
        expect.anything(),
      );
    });

    it('propagates transaction errors', async () => {
      seedRefs();
      mockEm.findOne.mockResolvedValue(null);
      mockEm.save.mockRejectedValueOnce(new Error('db error'));

      await expect(service.persist(extraction, file)).rejects.toThrow(
        'db error',
      );
    });
  });
});
