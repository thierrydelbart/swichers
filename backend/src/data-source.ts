import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { buildDbConnection } from './config/db.config';
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

config();

const { isProd, connection } = buildDbConnection(process.env);

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

export default new DataSource({
  type: 'postgres',
  ...connection,
  entities,
  migrations: isProd ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
  synchronize: false,
});
