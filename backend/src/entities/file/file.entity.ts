import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Game } from '../game/game.entity';
import { ExtractionResult } from '@services/game-persistence/extraction-result.interface';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 256 })
  location!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  hash!: string;

  @Column({ type: 'jsonb', nullable: true })
  extractedData: ExtractionResult | null = null;

  @ManyToOne(() => Game, { nullable: true })
  game: Game | null = null;
}
