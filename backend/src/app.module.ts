import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { buildDbConnection } from './config/db.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@services/auth/auth.module';
import { ScoreSheetModule } from '@services/score-sheet/score-sheet.module';
import { GameModule } from '@entities/game/game.module';
import { TeamModule } from '@entities/team/team.module';
import { LeagueModule } from '@entities/league/league.module';
import { GameImportModule } from '@entities/game-import/game-import.module';
import { GameImport } from '@entities/game-import/game-import.entity';
import { User } from '@entities/user/user.entity';
import { League } from '@entities/league/league.entity';
import { Club } from '@entities/club/club.entity';
import { Championship } from '@entities/championship/championship.entity';
import { Officer } from '@entities/officer/officer.entity';
import { Venue } from '@entities/venue/venue.entity';
import { Group } from '@entities/group/group.entity';
import { Team } from '@entities/team/team.entity';
import { Player } from '@entities/player/player.entity';
import { Coach } from '@entities/coach/coach.entity';
import { Game } from '@entities/game/game.entity';
import { GameOfficer } from '@entities/game-officer/game-officer.entity';
import { File } from '@entities/file/file.entity';
import { PlayerStatRow } from '@entities/player-stat-row/player-stat-row.entity';
import { CoachStatRow } from '@entities/coach-stat-row/coach-stat-row.entity';
import { TeamStatRow } from '@entities/team-stat-row/team-stat-row.entity';

const entities = [
  User,
  League,
  Club,
  Championship,
  Officer,
  Venue,
  Group,
  Team,
  Player,
  Coach,
  Game,
  GameOfficer,
  File,
  PlayerStatRow,
  CoachStatRow,
  TeamStatRow,
  GameImport,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    AuthModule,
    ScoreSheetModule,
    GameModule,
    TeamModule,
    LeagueModule,
    GameImportModule,
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => {
        const { isProd, connection } = buildDbConnection(process.env);
        return {
          type: 'postgres',
          ...connection,
          entities,
          synchronize: !isProd,
          migrations: ['dist/migrations/*.js'],
        };
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
