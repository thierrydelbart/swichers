import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './club.entity';
import { Team } from '@entities/team/team.entity';
import { Game } from '@entities/game/game.entity';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Team, Game])],
  controllers: [ClubController],
  providers: [ClubService],
  exports: [ClubService],
})
export class ClubModule {}
