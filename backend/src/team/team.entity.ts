import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Club } from '../club/club.entity';
import { Gender } from '../shared/gender.enum';
import { TeamCategory } from '../shared/team-category.enum';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  suffix: string | null;

  @Column({ type: 'enum', enum: TeamCategory, nullable: true })
  category: TeamCategory | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @ManyToOne(() => Club)
  club: Club;
}
