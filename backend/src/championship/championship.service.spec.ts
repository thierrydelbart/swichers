import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { ChampionshipService } from './championship.service';
import { Championship } from './championship.entity';
import { TeamCategory } from '../shared/team-category.enum';
import { Gender } from '../shared/gender.enum';
import { League } from '../league/league.entity';

const mockRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

const league = { id: 1, code: '0034', name: "Comité de l'Hérault" } as League;

describe('ChampionshipService', () => {
  let service: ChampionshipService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ChampionshipService,
        { provide: getRepositoryToken(Championship), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(ChampionshipService);
  });

  it('returns existing championship', async () => {
    const champ = { id: 1, name: 'PRM', season: '2025/26', league };
    mockRepo.findOne.mockResolvedValue(champ);
    const result = await service.findOrCreate(
      'PRM',
      '2025/26',
      'PRM',
      TeamCategory.SENIOR,
      Gender.MALE,
      league,
    );
    expect(result).toEqual(champ);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('backfills league on existing championship without one', async () => {
    const champ = { id: 1, name: 'PRM', season: '2025/26', league: null };
    mockRepo.findOne.mockResolvedValue(champ);
    mockRepo.save.mockResolvedValue({ ...champ, league });
    const result = await service.findOrCreate(
      'PRM',
      '2025/26',
      'PRM',
      TeamCategory.SENIOR,
      Gender.MALE,
      league,
    );
    expect(mockRepo.save).toHaveBeenCalledWith({ ...champ, league });
    expect(result.league).toEqual(league);
  });

  it('creates championship when not found', async () => {
    const champ = {
      id: 1,
      name: 'PRM',
      season: '2025/26',
      short_code: 'PRM',
      category: TeamCategory.SENIOR,
      gender: Gender.MALE,
      league,
    };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(champ);
    mockRepo.save.mockResolvedValue(champ);
    const result = await service.findOrCreate(
      'PRM',
      '2025/26',
      'PRM',
      TeamCategory.SENIOR,
      Gender.MALE,
      league,
    );
    expect(result).toEqual(champ);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
