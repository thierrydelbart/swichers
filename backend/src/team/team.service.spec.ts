import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { TeamService } from './team.service';
import { Team } from './team.entity';
import { Club } from '../club/club.entity';
import { TeamCategory } from '../shared/team-category.enum';
import { Gender } from '../shared/gender.enum';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const club = { id: 1, name: 'CLAPIERS' } as Club;

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: getRepositoryToken(Team), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(TeamService);
  });

  it('returns existing team', async () => {
    const team = {
      id: 1,
      name: 'CLAPIERS BASKET BALL',
      suffix: '1',
      category: null,
      gender: Gender.MALE,
      club,
    };
    mockRepo.findOne.mockResolvedValue(team);
    expect(
      await service.findOrCreate(
        'CLAPIERS BASKET BALL',
        '1',
        null,
        Gender.MALE,
        club,
      ),
    ).toEqual(team);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('creates team when not found', async () => {
    const team = {
      id: 1,
      name: 'CLAPIERS BASKET BALL',
      suffix: '1',
      category: TeamCategory.SENIOR,
      gender: Gender.MALE,
      club,
    };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(team);
    mockRepo.save.mockResolvedValue(team);
    expect(
      await service.findOrCreate(
        'CLAPIERS BASKET BALL',
        '1',
        TeamCategory.SENIOR,
        Gender.MALE,
        club,
      ),
    ).toEqual(team);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
