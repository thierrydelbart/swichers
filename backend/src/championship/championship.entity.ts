import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';

@Entity()
export class Championship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 9, nullable: true })
  season: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  short_code: string | null;

  @Column({ type: 'enum', enum: TeamCategory, nullable: true })
  category: TeamCategory | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;
}
