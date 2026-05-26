import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Game } from '../game/game.entity';
import { Officer } from '../officer/officer.entity';
import { GameOfficerRole } from './game-officer-role.enum';

@Entity()
export class GameOfficer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: GameOfficerRole })
  role!: GameOfficerRole;

  @Column({ type: 'int', nullable: true })
  rank: number | null = null;

  @ManyToOne(() => Game)
  game!: Game;

  @ManyToOne(() => Officer)
  officer!: Officer;
}
