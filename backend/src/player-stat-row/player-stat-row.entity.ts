import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Game } from '../game/game.entity';
import { Player } from '../player/player.entity';

@Entity()
export class PlayerStatRow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'boolean' })
  starter: boolean;

  @Column({ type: 'int' })
  time_played: number;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'int' })
  shots_made: number;

  @Column({ type: 'int' })
  three_pts_made: number;

  @Column({ type: 'int' })
  two_pts_in_made: number;

  @Column({ type: 'int' })
  two_pts_out_made: number;

  @Column({ type: 'int' })
  ft_made: number;

  @Column({ type: 'int' })
  fouls: number;

  @ManyToOne(() => Game)
  game: Game;

  @ManyToOne(() => Player)
  player: Player;
}
