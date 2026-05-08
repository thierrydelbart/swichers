import { Injectable } from '@nestjs/common';
import { ChampionshipService } from '../championship/championship.service';
import { ClubService } from '../club/club.service';
import { GroupService } from '../group/group.service';
import { Championship } from '../championship/championship.entity';
import { Club } from '../club/club.entity';
import { Group } from '../group/group.entity';
import { Team } from '../team/team.entity';
import { TeamService } from '../team/team.service';
import { Venue } from '../venue/venue.entity';
import { VenueService } from '../venue/venue.service';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { ExtractionResult } from './extraction-result.interface';

export interface GameReferences {
  championship: Championship;
  group: Group;
  venue: Venue;
  homeClub: Club;
  awayClub: Club;
  homeTeam: Team;
  awayTeam: Team;
}

@Injectable()
export class GamePersistenceService {
  constructor(
    private readonly championshipService: ChampionshipService,
    private readonly groupService: GroupService,
    private readonly venueService: VenueService,
    private readonly clubService: ClubService,
    private readonly teamService: TeamService,
  ) {}

  async resolveReferences(data: ExtractionResult): Promise<GameReferences> {
    const { competition, teams, game_info } = data;

    const category =
      (competition.category as TeamCategory) ?? TeamCategory.SENIOR;
    const gender = (competition.gender as Gender) ?? Gender.MALE;

    const championship = await this.championshipService.findOrCreate(
      competition.name,
      competition.season,
      competition.short_code,
      category,
      gender,
    );

    const [group, venue, homeClub, awayClub] = await Promise.all([
      this.groupService.findOrCreate(game_info.group, championship),
      this.venueService.findOrCreate(game_info.venue),
      this.clubService.findOrCreate(teams.home.name),
      this.clubService.findOrCreate(teams.away.name),
    ]);

    const [homeTeam, awayTeam] = await Promise.all([
      this.teamService.findOrCreate(
        teams.home.name,
        teams.home.suffix,
        category,
        gender,
        homeClub,
      ),
      this.teamService.findOrCreate(
        teams.away.name,
        teams.away.suffix,
        category,
        gender,
        awayClub,
      ),
    ]);

    return {
      championship,
      group,
      venue,
      homeClub,
      awayClub,
      homeTeam,
      awayTeam,
    };
  }
}
