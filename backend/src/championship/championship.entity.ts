import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Championship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 9, nullable: true })
  season: string | null;
}
