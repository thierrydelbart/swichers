import { Module } from '@nestjs/common';
import { ChampionshipModule } from '../championship/championship.module';
import { ClubModule } from '../club/club.module';
import { GroupModule } from '../group/group.module';
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
  ],
  providers: [GamePersistenceService],
  exports: [GamePersistenceService],
})
export class GamePersistenceModule {}
