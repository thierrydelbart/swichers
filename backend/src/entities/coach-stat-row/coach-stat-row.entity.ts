import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Game } from '../game/game.entity';
import { Coach } from '../coach/coach.entity';

@Entity()
export class CoachStatRow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  fouls!: number;

  @ManyToOne(() => Game)
  game!: Game;

  @ManyToOne(() => Coach)
  coach!: Coach;
}
