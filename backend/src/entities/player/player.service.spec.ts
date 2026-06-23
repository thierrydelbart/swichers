/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Player } from './player.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { Game } from '@entities/game/game.entity';
import { Club } from '../club/club.entity';

const mockQb = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({}),
};

const mockGameQb = {
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
};

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockPsrRepo = {
  createQueryBuilder: jest.fn(() => mockQb),
  find: jest.fn(),
};

const mockGameRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockGameQb),
};

const club = { id: 1, name: 'CLAPIERS' } as Club;

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepo.find.mockResolvedValue([]);
    const module = await Test.createTestingModule({
      providers: [
        PlayerService,
        { provide: getRepositoryToken(Player), useValue: mockRepo },
        { provide: getRepositoryToken(PlayerStatRow), useValue: mockPsrRepo },
        { provide: getRepositoryToken(Game), useValue: mockGameRepo },
      ],
    }).compile();
    service = module.get(PlayerService);
  });

  describe('normalizeKey', () => {
    it('lowercases and strips accents', () => {
      expect(service.normalizeKey('LÉFÈVRE', 'Élodie')).toBe('lefevre elodie');
    });

    it('handles plain ASCII names', () => {
      expect(service.normalizeKey('DENIS', 'Vincent')).toBe('denis vincent');
    });

    it('replaces hyphens with space', () => {
      expect(service.normalizeKey('MARTIN', 'Jean-Pierre')).toBe(
        'martin jean pierre',
      );
    });

    it('replaces straight apostrophe with space', () => {
      expect(service.normalizeKey("N'DIAYE", 'Mamadou')).toBe(
        'n diaye mamadou',
      );
    });

    it('replaces curly apostrophe with space', () => {
      expect(service.normalizeKey('N’DIAYE', 'Mamadou')).toBe(
        'n diaye mamadou',
      );
    });

    it('collapses multiple spaces', () => {
      expect(service.normalizeKey('JEAN--PAUL', 'Test')).toBe('jean paul test');
    });
  });

  describe('findOrCreate', () => {
    it('returns existing player', async () => {
      const player = {
        id: 1,
        last_name: 'DENIS',
        first_name: 'Vincent',
        search_key: 'denis vincent',
        merged_into: null,
        club,
      };
      mockRepo.findOne.mockResolvedValue(player);
      expect(await service.findOrCreate('DENIS', 'Vincent', club)).toEqual(
        player,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('creates player when not found', async () => {
      const player = {
        id: 1,
        last_name: 'DENIS',
        first_name: 'Vincent',
        search_key: 'denis vincent',
        merged_into: null,
        club,
      };
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(player);
      mockRepo.save.mockResolvedValue(player);
      expect(await service.findOrCreate('DENIS', 'Vincent', club)).toEqual(
        player,
      );
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('finds player case-insensitively', async () => {
      const player = {
        id: 1,
        last_name: 'DENIS',
        first_name: 'Vincent',
        search_key: 'denis vincent',
        merged_into: null,
        club,
      };
      mockRepo.findOne.mockResolvedValue(player);
      expect(await service.findOrCreate('denis', 'vincent', club)).toEqual(
        player,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('finds player accent-insensitively', async () => {
      const player = {
        id: 1,
        last_name: 'LEFEVRE',
        first_name: 'Élodie',
        search_key: 'lefevre elodie',
        merged_into: null,
        club,
      };
      mockRepo.findOne.mockResolvedValue(player);
      expect(await service.findOrCreate('LÉFÈVRE', 'Elodie', club)).toEqual(
        player,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('follows merged_into to return survivor', async () => {
      const survivor = {
        id: 2,
        last_name: 'DENIS',
        first_name: 'Vincent',
        search_key: 'denis vincent',
        merged_into: null,
        club,
      };
      const absorbed = {
        id: 1,
        last_name: 'DENIS',
        first_name: 'Vinc',
        search_key: 'denis vinc',
        merged_into: survivor,
        club,
      };
      mockRepo.findOne.mockResolvedValue(absorbed);
      expect(await service.findOrCreate('DENIS', 'Vinc', club)).toEqual(
        survivor,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('creates player with search_key populated', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockImplementation((data: Partial<Player>) => data);
      mockRepo.save.mockImplementation((data: Partial<Player>) =>
        Promise.resolve({ id: 1, ...data } as Player),
      );
      const result = await service.findOrCreate('MARTIN', 'Jean', club);
      expect(result.search_key).toBe('martin jean');
    });
  });

  describe('rename', () => {
    it('updates name and search_key', async () => {
      const player = {
        id: 1,
        last_name: 'DENIS',
        first_name: 'Vincent',
        search_key: 'denis vincent',
        merged_into: null,
        club,
      };
      mockRepo.findOne.mockResolvedValue(player);
      mockRepo.save.mockImplementation((p: Player) => Promise.resolve(p));
      const result = await service.rename(1, 'MARTIN', 'Jean');
      expect(result.last_name).toBe('MARTIN');
      expect(result.first_name).toBe('Jean');
      expect(result.search_key).toBe('martin jean');
    });

    it('throws NotFoundException when player not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.rename(99, 'X', 'Y')).rejects.toThrow(
        'Player #99 not found',
      );
    });
  });

  describe('findProfile', () => {
    const player = {
      id: 5,
      last_name: 'FABRE',
      first_name: 'Rémi',
      search_key: 'fabre remi',
      merged_into: null,
      club,
    };

    const makeRow = (
      season: string,
      teamA: {
        id: number;
        gender: string;
        suffix: string | null;
        clubId: number;
      },
      teamB: {
        id: number;
        gender: string;
        suffix: string | null;
        clubId: number;
      },
    ) => ({
      game: {
        group: { championship: { season } },
        team_a: {
          id: teamA.id,
          category: 'Senior',
          gender: teamA.gender,
          suffix: teamA.suffix,
          club: { id: teamA.clubId },
        },
        team_b: {
          id: teamB.id,
          category: 'Senior',
          gender: teamB.gender,
          suffix: teamB.suffix,
          club: { id: teamB.clubId },
        },
      },
    });

    it('throws NotFoundException when player not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findProfile(99)).rejects.toThrow(
        'Player #99 not found',
      );
    });

    it('returns empty teams and null season when player has no stat rows', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([]);
      const result: any = await service.findProfile(5);
      expect(result.id).toBe(5);
      expect(result.initials).toBe('RF');
      expect(result.club).toEqual({ id: 1, name: 'CLAPIERS' });
      expect(result.teams).toEqual([]);
      expect(result.season).toBeNull();
    });

    it('returns correct initials, club, and season', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.initials).toBe('RF');
      expect(result.season).toBe('2025/26');
    });

    it('picks the most recent season when rows span multiple seasons', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2024/25',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.season).toBe('2025/26');
    });

    it("includes only teams from the player's club", async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].id).toBe(10);
    });

    it('deduplicates teams appearing in multiple games', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 30, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].id).toBe(10);
    });

    it('formats team label: Male with suffix → "Senior Masculin 1"', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.teams[0].label).toBe('Senior Masculin 1');
    });

    it('formats team label: Female without suffix → "Senior Féminin"', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2025/26',
          { id: 20, gender: 'Female', suffix: null, clubId: 1 },
          { id: 30, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.teams[0].label).toBe('Senior Féminin');
    });

    it("collects teams from both team_a and team_b when both belong to player's club", async () => {
      const sameClubPlayer = { ...player, club: { id: 1, name: 'CLAPIERS' } };
      mockRepo.findOne.mockResolvedValue(sameClubPlayer);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Female', suffix: null, clubId: 1 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.teams).toHaveLength(2);
      expect(result.teams.map((t: any) => t.id).sort()).toEqual([10, 20]);
    });

    it('ignores rows from older season when filtering teams', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeRow(
          '2024/25',
          { id: 99, gender: 'Male', suffix: '2', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
        makeRow(
          '2025/26',
          { id: 10, gender: 'Male', suffix: '1', clubId: 1 },
          { id: 20, gender: 'Male', suffix: null, clubId: 2 },
        ),
      ]);
      const result: any = await service.findProfile(5);
      expect(result.teams.map((t: any) => t.id)).toEqual([10]);
    });
  });

  describe('findStats', () => {
    const player = {
      id: 5,
      last_name: 'FABRE',
      first_name: 'Rémi',
      search_key: 'fabre remi',
      merged_into: null,
      club,
    };

    const makeStatRow = (
      season: string,
      gameId: number,
      teamA: { id: number; clubId: number },
      teamB: { id: number; clubId: number },
      stats: {
        points: number;
        three_pts_made: number;
        shots_made: number;
        ft_made: number;
        fouls: number;
      },
      starter = false,
    ) => ({
      starter,
      points: stats.points,
      three_pts_made: stats.three_pts_made,
      shots_made: stats.shots_made,
      ft_made: stats.ft_made,
      fouls: stats.fouls,
      game: {
        id: gameId,
        group: { championship: { season } },
        team_a: { id: teamA.id, club: { id: teamA.clubId } },
        team_b: { id: teamB.id, club: { id: teamB.clubId } },
      },
    });

    it('throws NotFoundException when player not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findStats(99)).rejects.toThrow(
        'Player #99 not found',
      );
    });

    it('returns zeros and null cells when player has no stat rows', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([]);
      const result: any = await service.findStats(5);
      expect(result.games_played).toBe(0);
      expect(result.team_games_total).toBe(0);
      expect(result.starters).toBe(0);
      expect(result.points).toBeNull();
    });

    it('computes games_played and starters', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeStatRow(
          '2025/26',
          1,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 10,
            three_pts_made: 1,
            shots_made: 3,
            ft_made: 2,
            fouls: 2,
          },
          true,
        ),
        makeStatRow(
          '2025/26',
          2,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 20,
            three_pts_made: 2,
            shots_made: 5,
            ft_made: 0,
            fouls: 3,
          },
          false,
        ),
        makeStatRow(
          '2025/26',
          3,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 15,
            three_pts_made: 0,
            shots_made: 4,
            ft_made: 5,
            fouls: 1,
          },
          true,
        ),
      ]);
      mockGameQb.getMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const result: any = await service.findStats(5);
      expect(result.games_played).toBe(3);
      expect(result.starters).toBe(2);
    });

    it('computes avg, min, max for points', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeStatRow(
          '2025/26',
          1,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 10,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
        makeStatRow(
          '2025/26',
          2,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 20,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
        makeStatRow(
          '2025/26',
          3,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 15,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
      ]);
      mockGameQb.getMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const result: any = await service.findStats(5);
      expect(result.points.avg).toBe(15);
      expect(result.points.min).toEqual({ value: 10, game_id: 1 });
      expect(result.points.max).toEqual({ value: 20, game_id: 2 });
    });

    it('rounds avg to 1 decimal', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeStatRow(
          '2025/26',
          1,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 10,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
        makeStatRow(
          '2025/26',
          2,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 11,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
        makeStatRow(
          '2025/26',
          3,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 12,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
      ]);
      mockGameQb.getMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const result: any = await service.findStats(5);
      expect(result.points.avg).toBe(11);
    });

    it('uses only the most recent season rows', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeStatRow(
          '2024/25',
          10,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          { points: 5, three_pts_made: 0, shots_made: 0, ft_made: 0, fouls: 0 },
        ),
        makeStatRow(
          '2025/26',
          1,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 20,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
      ]);
      mockGameQb.getMany.mockResolvedValue([{ id: 1 }]);
      const result: any = await service.findStats(5);
      expect(result.games_played).toBe(1);
      expect(result.points.avg).toBe(20);
    });

    it('team_games_total counts distinct game IDs from gameRepo', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeStatRow(
          '2025/26',
          1,
          { id: 10, clubId: 1 },
          { id: 20, clubId: 2 },
          {
            points: 10,
            three_pts_made: 0,
            shots_made: 0,
            ft_made: 0,
            fouls: 0,
          },
        ),
      ]);
      mockGameQb.getMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const result: any = await service.findStats(5);
      expect(result.team_games_total).toBe(3);
    });
  });

  describe('findGames', () => {
    const player = {
      id: 5,
      last_name: 'FABRE',
      first_name: 'Rémi',
      search_key: 'fabre remi',
      merged_into: null,
      club,
    };

    const makeGameRow = (
      season: string,
      gameId: number,
      day: string,
      teamA: { id: number; name: string; clubId: number },
      teamB: { id: number; name: string; clubId: number },
      scoreA: number | null,
      scoreB: number | null,
      starter: boolean,
      shortCode: string | null = 'PRM',
    ) => ({
      starter,
      points: 10,
      three_pts_made: 1,
      shots_made: 3,
      ft_made: 2,
      fouls: 2,
      game: {
        id: gameId,
        day: new Date(day),
        score_a: scoreA,
        score_b: scoreB,
        group: {
          championship: {
            season,
            name: 'Promotion Régionale Masculine',
            short_code: shortCode,
          },
        },
        team_a: { id: teamA.id, name: teamA.name, club: { id: teamA.clubId } },
        team_b: { id: teamB.id, name: teamB.name, club: { id: teamB.clubId } },
      },
    });

    it('throws NotFoundException when player not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findGames(99)).rejects.toThrow(
        'Player #99 not found',
      );
    });

    it('returns empty array when no stat rows', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([]);
      const result: any = await service.findGames(5);
      expect(result).toEqual([]);
    });

    it('returns rows sorted by date DESC', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeGameRow(
          '2025/26',
          1,
          '2025-10-01',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'MONTPELLIER', clubId: 2 },
          80,
          70,
          true,
        ),
        makeGameRow(
          '2025/26',
          2,
          '2025-11-15',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'MONTPELLIER', clubId: 2 },
          60,
          65,
          false,
        ),
      ]);
      const result: any = await service.findGames(5);
      expect(result[0].game_id).toBe(2);
      expect(result[1].game_id).toBe(1);
    });

    it('computes won correctly for team_a side', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeGameRow(
          '2025/26',
          1,
          '2025-11-01',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'GRABELS', clubId: 2 },
          80,
          70,
          true,
        ),
      ]);
      const result: any = await service.findGames(5);
      expect(result[0].won).toBe(true);
      expect(result[0].opponent).toBe('GRABELS');
    });

    it('computes won=false for team_b side', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeGameRow(
          '2025/26',
          1,
          '2025-11-01',
          { id: 20, name: 'GRABELS', clubId: 2 },
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          80,
          70,
          false,
        ),
      ]);
      const result: any = await service.findGames(5);
      expect(result[0].won).toBe(false);
      expect(result[0].opponent).toBe('GRABELS');
    });

    it('returns won=null when scores are null', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeGameRow(
          '2025/26',
          1,
          '2025-11-01',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'GRABELS', clubId: 2 },
          null,
          null,
          true,
        ),
      ]);
      const result: any = await service.findGames(5);
      expect(result[0].won).toBeNull();
    });

    it('uses short_code as badge, falls back to name', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeGameRow(
          '2025/26',
          1,
          '2025-11-01',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'GRABELS', clubId: 2 },
          80,
          70,
          true,
          null,
        ),
      ]);
      const result: any = await service.findGames(5);
      expect(result[0].championship_badge).toBe(
        'Promotion Régionale Masculine',
      );
    });

    it('uses only most recent season rows', async () => {
      mockRepo.findOne.mockResolvedValue(player);
      mockPsrRepo.find.mockResolvedValue([
        makeGameRow(
          '2024/25',
          10,
          '2024-11-01',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'GRABELS', clubId: 2 },
          80,
          70,
          true,
        ),
        makeGameRow(
          '2025/26',
          1,
          '2025-11-01',
          { id: 10, name: 'CLAPIERS', clubId: 1 },
          { id: 20, name: 'GRABELS', clubId: 2 },
          70,
          75,
          false,
        ),
      ]);
      const result: any = await service.findGames(5);
      expect(result).toHaveLength(1);
      expect(result[0].game_id).toBe(1);
    });
  });

  describe('merge', () => {
    const survivor = {
      id: 1,
      last_name: 'MARTIN',
      first_name: 'Jean',
      search_key: 'martin jean',
      merged_into: null,
      club,
    };
    const absorbed = {
      id: 2,
      last_name: 'MARTEN',
      first_name: 'Jean',
      search_key: 'marten jean',
      merged_into: null,
      club,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockRepo.find.mockResolvedValue([]);
      mockRepo.save.mockImplementation((p: Player) => Promise.resolve(p));
      mockPsrRepo.createQueryBuilder.mockReturnValue(mockQb);
      mockQb.execute.mockResolvedValue({});
    });

    it('renames survivor, relinks PSRs, sets merged_into on absorbed', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(survivor)
        .mockResolvedValueOnce(absorbed);
      await service.merge(1, [2], 'MARTIN', 'Jean');
      expect(survivor.last_name).toBe('MARTIN');
      expect(survivor.search_key).toBe('martin jean');
      expect(mockQb.where).toHaveBeenCalledWith('playerId = :id', { id: 2 });
      expect(mockQb.execute).toHaveBeenCalled();
      expect(absorbed.merged_into).toBe(survivor);
    });

    it('throws NotFoundException if survivor not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.merge(99, [2], 'X', 'Y')).rejects.toThrow(
        'Player #99 not found',
      );
    });

    it('throws NotFoundException if absorbed player not found', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(survivor)
        .mockResolvedValueOnce(null);
      await expect(service.merge(1, [99], 'X', 'Y')).rejects.toThrow(
        'Player #99 not found',
      );
    });

    it('throws BadRequestException if absorbed player is from different club', async () => {
      const otherClub = { id: 2, name: 'OTHER' } as Club;
      const foreignPlayer = { ...absorbed, club: otherClub };
      mockRepo.findOne
        .mockResolvedValueOnce(survivor)
        .mockResolvedValueOnce(foreignPlayer);
      await expect(service.merge(1, [2], 'X', 'Y')).rejects.toThrow(
        'belongs to a different club',
      );
    });
  });
});
