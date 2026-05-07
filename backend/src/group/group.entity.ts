import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Championship } from '../championship/championship.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @ManyToOne(() => Championship)
  championship: Championship;
}
