import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { LeagueService } from './league.service';
import { League } from './league.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

describe('LeagueService', () => {
  let service: LeagueService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        LeagueService,
        { provide: getRepositoryToken(League), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(LeagueService);
  });

  it('returns existing league', async () => {
    const league = { id: 1, code: '0034', name: "Comité de l'Hérault" };
    mockRepo.findOne.mockResolvedValue(league);
    const result = await service.findOrCreate('0034');
    expect(result).toEqual(league);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates league with known name', async () => {
    const league = { id: 1, code: '0034', name: "Comité de l'Hérault" };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(league);
    mockRepo.save.mockResolvedValue(league);
    const result = await service.findOrCreate('0034');
    expect(mockRepo.create).toHaveBeenCalledWith({
      code: '0034',
      name: "Comité de l'Hérault",
    });
    expect(result).toEqual(league);
  });

  it('falls back to code as name for unknown league', async () => {
    const league = { id: 2, code: '0099', name: '0099' };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(league);
    mockRepo.save.mockResolvedValue(league);
    await service.findOrCreate('0099');
    expect(mockRepo.create).toHaveBeenCalledWith({
      code: '0099',
      name: '0099',
    });
  });
});
