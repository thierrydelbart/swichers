import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@services/auth/auth.module';
import { Game } from '@entities/game/game.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { Player } from './player.entity';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, PlayerStatRow, Game]),
    AuthModule,
  ],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
