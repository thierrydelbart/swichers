import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Player } from './player.entity';
import { Club } from '../club/club.entity';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
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
});
