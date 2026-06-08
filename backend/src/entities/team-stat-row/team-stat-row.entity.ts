import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Game } from '../game/game.entity';
import { Team } from '../team/team.entity';
import { TeamStatType } from './team-stat-type.enum';

@Entity()
export class TeamStatRow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: TeamStatType })
  type!: TeamStatType;

  @Column({ type: 'int', nullable: true })
  time_played: number | null = null;

  @Column({ type: 'int', nullable: true })
  points: number | null = null;

  @Column({ type: 'int', nullable: true })
  shots_made: number | null = null;

  @Column({ type: 'int', nullable: true })
  three_pts_made: number | null = null;

  @Column({ type: 'int', nullable: true })
  two_pts_in_made: number | null = null;

  @Column({ type: 'int', nullable: true })
  two_pts_out_made: number | null = null;

  @Column({ type: 'int', nullable: true })
  ft_made: number | null = null;

  @Column({ type: 'int', nullable: true })
  fouls: number | null = null;

  @ManyToOne(() => Game)
  game!: Game;

  @ManyToOne(() => Team)
  team!: Team;
}
