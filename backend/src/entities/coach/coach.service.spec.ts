import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { CoachService } from './coach.service';
import { Coach } from './coach.entity';
import { Club } from '../club/club.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const club = { id: 1, name: 'CLAPIERS' } as Club;

describe('CoachService', () => {
  let service: CoachService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CoachService,
        { provide: getRepositoryToken(Coach), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(CoachService);
  });

  it('returns existing coach', async () => {
    const coach = { id: 1, last_name: 'DUPONT', first_name: 'Jean', club };
    mockRepo.findOne.mockResolvedValue(coach);
    expect(await service.findOrCreate('DUPONT', 'Jean', club)).toEqual(coach);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates coach when not found', async () => {
    const coach = { id: 1, last_name: 'DUPONT', first_name: 'Jean', club };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(coach);
    mockRepo.save.mockResolvedValue(coach);
    expect(await service.findOrCreate('DUPONT', 'Jean', club)).toEqual(coach);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
