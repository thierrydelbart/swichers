import { Module } from '@nestjs/common';
import { ChampionshipModule } from '../championship/championship.module';
import { ClubModule } from '../club/club.module';
import { CoachModule } from '../coach/coach.module';
import { GroupModule } from '../group/group.module';
import { OfficerModule } from '../officer/officer.module';
import { PlayerModule } from '../player/player.module';
import { TeamModule } from '../team/team.module';
import { VenueModule } from '../venue/venue.module';
import { GamePersistenceService } from './game-persistence.service';

@Module({
  imports: [
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
