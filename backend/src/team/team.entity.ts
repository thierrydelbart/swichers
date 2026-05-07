import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Club } from '../club/club.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  suffix: string | null;

  @ManyToOne(() => Club)
  club: Club;
}
