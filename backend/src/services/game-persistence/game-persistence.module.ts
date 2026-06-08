import { Module } from '@nestjs/common';
import { ChampionshipModule } from '@entities/championship/championship.module';
import { LeagueModule } from '@entities/league/league.module';
import { ClubModule } from '@entities/club/club.module';
import { CoachModule } from '@entities/coach/coach.module';
import { GroupModule } from '@entities/group/group.module';
import { OfficerModule } from '@entities/officer/officer.module';
import { PlayerModule } from '@entities/player/player.module';
import { TeamModule } from '@entities/team/team.module';
import { VenueModule } from '@entities/venue/venue.module';
import { GamePersistenceService } from './game-persistence.service';

@Module({
  imports: [
    LeagueModule,
    ChampionshipModule,
    GroupModule,
    VenueModule,
    ClubModule,
    TeamModule,
    OfficerModule,
    PlayerModule,
    CoachModule,
  ],
  providers: [GamePersistenceService],
  exports: [GamePersistenceService],
})
export class GamePersistenceModule {}
