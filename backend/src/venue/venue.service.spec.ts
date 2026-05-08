import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { VenueService } from './venue.service';
import { Venue } from './venue.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

describe('VenueService', () => {
  let service: VenueService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: getRepositoryToken(Venue), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(VenueService);
  });

  it('returns existing venue', async () => {
    const venue = { id: 1, name: 'CLAPIERS' };
    mockRepo.findOne.mockResolvedValue(venue);
    expect(await service.findOrCreate('CLAPIERS')).toEqual(venue);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates venue when not found', async () => {
    const venue = { id: 1, name: 'CLAPIERS' };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(venue);
    mockRepo.save.mockResolvedValue(venue);
    expect(await service.findOrCreate('CLAPIERS')).toEqual(venue);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
