import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Club } from '../club/club.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  last_name: string;

  @Column({ type: 'varchar', length: 50 })
  first_name: string;

  @ManyToOne(() => Club)
  club: Club;
}
