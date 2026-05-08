import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { Player } from './player.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly repo: Repository<Player>,
  ) {}

  async findOrCreate(
    lastName: string,
    firstName: string,
    club: Club,
  ): Promise<Player> {
    const existing = await this.repo.findOne({
      where: {
        last_name: lastName,
        first_name: firstName,
        club: { id: club.id },
      },
    });
    if (existing) return existing;
    return this.repo.save(
      this.repo.create({ last_name: lastName, first_name: firstName, club }),
    );
  }
}
