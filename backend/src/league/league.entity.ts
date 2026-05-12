import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Championship } from '../championship/championship.entity';

@Entity()
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Championship, (c) => c.league)
  championships: Championship[];
}
