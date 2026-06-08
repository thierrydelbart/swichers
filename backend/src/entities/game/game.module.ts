import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../services/auth/auth.module';
import { Game } from './game.entity';
import { File } from '../file/file.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { TeamStatRow } from '../team-stat-row/team-stat-row.entity';
import { CoachStatRow } from '../coach-stat-row/coach-stat-row.entity';
import { GameOfficer } from '../game-officer/game-officer.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Game,
      File,
      PlayerStatRow,
      TeamStatRow,
      CoachStatRow,
      GameOfficer,
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
