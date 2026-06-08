import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from '../file/file.entity';
import { Game } from '../game/game.entity';
import { GameImportStatus } from './game-import-status.enum';

@Entity()
export class GameImport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: GameImportStatus,
    default: GameImportStatus.PENDING,
  })
  status!: GameImportStatus;

  @Column({ type: 'text', nullable: true })
  error_message: string | null = null;

  @Column({ type: 'varchar', length: 256 })
  filename!: string;

  @Column({ type: 'varchar', length: 20 })
  league_code!: string;

  @Column({ type: 'varchar', length: 50 })
  championship_code!: string;

  @Column({ type: 'varchar', length: 50 })
  group_name!: string;

  @Column({ type: 'varchar', length: 20 })
  game_number!: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  game_name: string | null = null;

  @ManyToOne(() => File, { nullable: true })
  file: File | null = null;

  @ManyToOne(() => Game, { nullable: true })
  game: Game | null = null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  extraction_started_at: Date | null = null;
}
