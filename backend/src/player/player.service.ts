import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Club } from '../club/club.entity';
import { PlayerStatRow } from '../player-stat-row/player-stat-row.entity';
import { Player } from './player.entity';

@Injectable()
export class PlayerService implements OnModuleInit {
  constructor(
    @InjectRepository(Player)
    private readonly repo: Repository<Player>,
    @InjectRepository(PlayerStatRow)
    private readonly psrRepo: Repository<PlayerStatRow>,
  ) {}

  normalizeKey(lastName: string, firstName: string): string {
    return (lastName + ' ' + firstName)
      .replace(/[-'‘’]/g, ' ')
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

  async merge(
    survivorId: number,
    absorbedIds: number[],
    lastName: string,
    firstName: string,
  ): Promise<Player> {
    const survivor = await this.repo.findOne({
      where: { id: survivorId },
      relations: ['club'],
    });
    if (!survivor)
      throw new NotFoundException(`Player #${survivorId} not found`);

    const absorbed = await Promise.all(
      absorbedIds.map(async (id) => {
        const p = await this.repo.findOne({
          where: { id },
          relations: ['club'],
        });
        if (!p) throw new NotFoundException(`Player #${id} not found`);
        return p;
      }),
    );

    for (const p of absorbed) {
      if (p.club.id !== survivor.club.id) {
        throw new BadRequestException(
          `Player #${p.id} belongs to a different club than the survivor`,
        );
      }
    }

    survivor.last_name = lastName;
    survivor.first_name = firstName;
    survivor.search_key = this.normalizeKey(lastName, firstName);
    await this.repo.save(survivor);

    for (const p of absorbed) {
      await this.psrRepo
        .createQueryBuilder()
        .update(PlayerStatRow)
        .set({ player: survivor })
        .where('playerId = :id', { id: p.id })
        .execute();
      p.merged_into = survivor;
      await this.repo.save(p);
    }

    return survivor;
  }
}
