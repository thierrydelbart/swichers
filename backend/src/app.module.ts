import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { Club } from './club/club.entity';
import { Championship } from './championship/championship.entity';
import { Officer } from './officer/officer.entity';
import { Venue } from './venue/venue.entity';
import { Group } from './group/group.entity';
import { Team } from './team/team.entity';
import { Player } from './player/player.entity';
import { Coach } from './coach/coach.entity';
import { Game } from './game/game.entity';
import { GameOfficer } from './game-officer/game-officer.entity';
import { File } from './file/file.entity';
import { PlayerStatRow } from './player-stat-row/player-stat-row.entity';
import { CoachStatRow } from './coach-stat-row/coach-stat-row.entity';
import { TeamStatRow } from './team-stat-row/team-stat-row.entity';

const entities = [
  User,
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
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
