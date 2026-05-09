import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, PlayerStatRow])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
