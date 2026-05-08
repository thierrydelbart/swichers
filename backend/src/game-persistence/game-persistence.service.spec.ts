import { Test } from '@nestjs/testing';
import { GamePersistenceService } from './game-persistence.service';
import { ChampionshipService } from '../championship/championship.service';
import { GroupService } from '../group/group.service';
import { VenueService } from '../venue/venue.service';
import { ClubService } from '../club/club.service';
import { TeamService } from '../team/team.service';
import { ExtractionResult } from './extraction-result.interface';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';

const mockChampionshipService = { findOrCreate: jest.fn() };
const mockGroupService = { findOrCreate: jest.fn() };
const mockVenueService = { findOrCreate: jest.fn() };
const mockClubService = { findOrCreate: jest.fn() };
const mockTeamService = { findOrCreate: jest.fn() };

const extraction: ExtractionResult = {
  competition: {
    name: 'Pré régionale masculine',
    short_code: 'PRM',
    season: '2025/26',
    category: 'Senior',
    gender: 'Male',
  },
  teams: {
    home: { name: 'CLAPIERS BASKET BALL', suffix: '1' },
    away: { name: 'MONTPELLIER UC', suffix: null },
  },
  game_info: {
    game_number: 42,
    date: '15/11/25',
    time: '20:00',
    venue: 'Salle des sports',
    group: 'Poule A',
    referees: { first: 'REF1', second: 'REF2', third: null },
  },
  stats: {
    home: { players: [], totals: {} as never, coach: { name: null, fouls: 0 } },
    away: { players: [], totals: {} as never, coach: { name: null, fouls: 0 } },
  },
  warnings: [],
};

describe('GamePersistenceService', () => {
  let service: GamePersistenceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        GamePersistenceService,
        { provide: ChampionshipService, useValue: mockChampionshipService },
        { provide: GroupService, useValue: mockGroupService },
        { provide: VenueService, useValue: mockVenueService },
        { provide: ClubService, useValue: mockClubService },
        { provide: TeamService, useValue: mockTeamService },
      ],
    }).compile();
    service = module.get(GamePersistenceService);
  });

  it('resolves all references', async () => {
    const championship = { id: 1, name: 'Pré régionale masculine' };
    const group = { id: 1, name: 'Poule A' };
    const venue = { id: 1, name: 'Salle des sports' };
    const homeClub = { id: 1, name: 'CLAPIERS BASKET BALL' };
    const awayClub = { id: 2, name: 'MONTPELLIER UC' };
    const homeTeam = { id: 1, name: 'CLAPIERS BASKET BALL', suffix: '1' };
    const awayTeam = { id: 2, name: 'MONTPELLIER UC', suffix: null };

    mockChampionshipService.findOrCreate.mockResolvedValue(championship);
    mockGroupService.findOrCreate.mockResolvedValue(group);
    mockVenueService.findOrCreate.mockResolvedValue(venue);
    mockClubService.findOrCreate
      .mockResolvedValueOnce(homeClub)
      .mockResolvedValueOnce(awayClub);
    mockTeamService.findOrCreate
      .mockResolvedValueOnce(homeTeam)
      .mockResolvedValueOnce(awayTeam);

    const refs = await service.resolveReferences(extraction);

    expect(refs).toEqual({
      championship,
      group,
      venue,
      homeClub,
      awayClub,
      homeTeam,
      awayTeam,
    });

    expect(mockChampionshipService.findOrCreate).toHaveBeenCalledWith(
      'Pré régionale masculine',
      '2025/26',
      'PRM',
      TeamCategory.SENIOR,
      Gender.MALE,
    );
    expect(mockGroupService.findOrCreate).toHaveBeenCalledWith(
      'Poule A',
      championship,
    );
    expect(mockVenueService.findOrCreate).toHaveBeenCalledWith(
      'Salle des sports',
    );
    expect(mockClubService.findOrCreate).toHaveBeenCalledWith(
      'CLAPIERS BASKET BALL',
    );
    expect(mockClubService.findOrCreate).toHaveBeenCalledWith('MONTPELLIER UC');
    expect(mockTeamService.findOrCreate).toHaveBeenCalledWith(
      'CLAPIERS BASKET BALL',
      '1',
      TeamCategory.SENIOR,
      Gender.MALE,
      homeClub,
    );
    expect(mockTeamService.findOrCreate).toHaveBeenCalledWith(
      'MONTPELLIER UC',
      null,
      TeamCategory.SENIOR,
      Gender.MALE,
      awayClub,
    );
  });
});
