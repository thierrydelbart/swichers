import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { ClubService } from './club.service';
import { Club } from './club.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

describe('ClubService', () => {
  let service: ClubService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ClubService,
        { provide: getRepositoryToken(Club), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(ClubService);
  });

  it('returns existing club', async () => {
    const club = { id: 1, name: 'CLAPIERS' };
    mockRepo.findOne.mockResolvedValue(club);
    expect(await service.findOrCreate('CLAPIERS')).toEqual(club);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates club when not found', async () => {
    const club = { id: 1, name: 'CLAPIERS' };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(club);
    mockRepo.save.mockResolvedValue(club);
    expect(await service.findOrCreate('CLAPIERS')).toEqual(club);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
