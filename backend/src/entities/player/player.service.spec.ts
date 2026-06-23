/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Player } from './player.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { Club } from '../club/club.entity';

const mockQb = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({}),
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
