import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venue } from '../venue/venue.entity';
import { Group } from '../group/group.entity';
import { Team } from '../team/team.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  day: Date;

  @Column({ type: 'int' })
  time: number;

  @Column({ type: 'varchar', length: 20 })
  game_number: string;

  @Column({ type: 'int', nullable: true })
  score_a: number;

  @Column({ type: 'int', nullable: true })
  score_b: number;

  @ManyToOne(() => Venue)
  venue: Venue;

  @ManyToOne(() => Group)
  group: Group;

  @ManyToOne(() => Team)
  team_a: Team;

  @ManyToOne(() => Team)
  team_b: Team;
}
