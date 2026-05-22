import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Club } from '../club/club.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  last_name: string;

  @Column({ type: 'varchar', length: 50 })
  first_name: string;

  @Index()
  @Column({ type: 'varchar', length: 101, nullable: true })
  search_key: string | null;

  @ManyToOne(() => Player, { nullable: true })
  merged_into: Player | null;

  @ManyToOne(() => Club)
  club: Club;
}
