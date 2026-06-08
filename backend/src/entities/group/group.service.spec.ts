import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { Championship } from '../championship/championship.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const championship = { id: 1, name: 'PRM', season: '2025/26' } as Championship;

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: getRepositoryToken(Group), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(GroupService);
  });

  it('returns existing group', async () => {
    const group = { id: 1, name: 'A', championship };
    mockRepo.findOne.mockResolvedValue(group);
    expect(await service.findOrCreate('A', championship)).toEqual(group);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates group when not found', async () => {
    const group = { id: 1, name: 'A', championship };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(group);
    mockRepo.save.mockResolvedValue(group);
    expect(await service.findOrCreate('A', championship)).toEqual(group);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
