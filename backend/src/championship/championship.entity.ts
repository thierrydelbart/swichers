import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';

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
}
