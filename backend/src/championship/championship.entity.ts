import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';
import { League } from '../league/league.entity';

@Entity()
export class Championship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 9 })
  season: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  short_code: string | null;

  @Column({ type: 'enum', enum: TeamCategory })
  category: TeamCategory;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  // nullable: true to allow synchronize before backfill runs on startup
  @ManyToOne(() => League, (l) => l.championships, { nullable: true })
  league: League | null;
}
