import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Club } from '../club/club.entity';

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  address: string | null = null;

  @ManyToOne(() => Club, { nullable: true })
  club: Club | null = null;
}
