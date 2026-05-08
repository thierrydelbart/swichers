import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Player } from './player.entity';
import { Club } from '../club/club.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const club = { id: 1, name: 'CLAPIERS' } as Club;

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PlayerService,
        { provide: getRepositoryToken(Player), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(PlayerService);
  });

  it('returns existing player', async () => {
    const player = { id: 1, last_name: 'DENIS', first_name: 'Vincent', club };
    mockRepo.findOne.mockResolvedValue(player);
    expect(await service.findOrCreate('DENIS', 'Vincent', club)).toEqual(
      player,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates player when not found', async () => {
    const player = { id: 1, last_name: 'DENIS', first_name: 'Vincent', club };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(player);
    mockRepo.save.mockResolvedValue(player);
    expect(await service.findOrCreate('DENIS', 'Vincent', club)).toEqual(
      player,
    );
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
