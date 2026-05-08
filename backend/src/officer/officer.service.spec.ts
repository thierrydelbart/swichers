import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { OfficerService } from './officer.service';
import { Officer } from './officer.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

describe('OfficerService', () => {
  let service: OfficerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OfficerService,
        { provide: getRepositoryToken(Officer), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(OfficerService);
  });

  it('returns existing officer', async () => {
    const officer = { id: 1, name: 'CAVALLI O' };
    mockRepo.findOne.mockResolvedValue(officer);
    expect(await service.findOrCreate('CAVALLI O')).toEqual(officer);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates officer when not found', async () => {
    const officer = { id: 1, name: 'CAVALLI O' };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(officer);
    mockRepo.save.mockResolvedValue(officer);
    expect(await service.findOrCreate('CAVALLI O')).toEqual(officer);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
