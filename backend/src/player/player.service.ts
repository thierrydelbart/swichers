import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { Player } from './player.entity';

@Injectable()
export class PlayerService implements OnModuleInit {
  constructor(
    @InjectRepository(Player)
    private readonly repo: Repository<Player>,
  ) {}

  normalizeKey(lastName: string, firstName: string): string {
    return (lastName + ' ' + firstName)
      .replace(/[-\u0027\u2018\u2019]/g, ' ')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  async onModuleInit(): Promise<void> {
    const players = await this.repo.find({
      where: [{ search_key: IsNull() }, { search_key: '' }],
    });
    for (const p of players) {
      p.search_key = this.normalizeKey(p.last_name, p.first_name);
      await this.repo.save(p);
    }
  }

  async findOrCreate(
    lastName: string,
    firstName: string,
    club: Club,
  ): Promise<Player> {
    const key = this.normalizeKey(lastName, firstName);
    const existing = await this.repo.findOne({
      where: { search_key: key, club: { id: club.id } },
      relations: ['merged_into'],
    });
    if (existing) return existing.merged_into ?? existing;
    return this.repo.save(
      this.repo.create({
        last_name: lastName,
        first_name: firstName,
        search_key: key,
        club,
      }),
    );
  }

  async rename(
    id: number,
    lastName: string,
    firstName: string,
  ): Promise<Player> {
    const player = await this.repo.findOne({ where: { id } });
    if (!player) throw new NotFoundException(`Player #${id} not found`);
    player.last_name = lastName;
    player.first_name = firstName;
    player.search_key = this.normalizeKey(lastName, firstName);
    return this.repo.save(player);
  }
}
