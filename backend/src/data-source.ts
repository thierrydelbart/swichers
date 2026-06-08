import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { buildDbConnection } from './config/db.config';
import { GameImport } from './game-import/game-import.entity';
import { User } from './user/user.entity';
import { League } from './league/league.entity';
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
