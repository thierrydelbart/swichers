import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venue } from '@entities/venue/venue.entity';
import { Group } from '@entities/group/group.entity';
import { Team } from '@entities/team/team.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  day!: Date;

  @Column({ type: 'int' })
  time!: number;

  @Column({ type: 'varchar', length: 20 })
  game_number!: string;

  @Column({ type: 'int', nullable: true })
  score_a: number | null = null;

  @Column({ type: 'int', nullable: true })
  score_b: number | null = null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  blog_title: string | null = null;

  @Column({ type: 'text', nullable: true })
  blog_content: string | null = null;

  @ManyToOne(() => Venue)
  venue!: Venue;

  @ManyToOne(() => Group)
  group!: Group;

  @ManyToOne(() => Team)
  team_a!: Team;

  @ManyToOne(() => Team)
  team_b!: Team;
}
