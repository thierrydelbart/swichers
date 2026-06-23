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
import { Team } from '../team/team.entity';
import { Gender } from '@shared/gender.enum';
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

  async findProfile(id: number) {
    const player = await this.repo.findOne({
      where: { id },
      relations: ['club'],
    });
    if (!player) throw new NotFoundException(`Player #${id} not found`);

    const rows = await this.psrRepo.find({
      where: { player: { id } },
      relations: {
        game: {
          group: { championship: true },
          team_a: { club: true },
          team_b: { club: true },
        },
      },
    });

    if (rows.length === 0) {
      return {
        id: player.id,
        last_name: player.last_name,
        first_name: player.first_name,
        initials: this.buildInitials(player.first_name, player.last_name),
        club: { id: player.club.id, name: player.club.name },
        teams: [],
        season: null,
      };
    }

    const season = rows.reduce((latest, r) => {
      const s = r.game.group.championship.season;
      return s > latest ? s : latest;
    }, rows[0].game.group.championship.season);

    const seasonRows = rows.filter(
      (r) => r.game.group.championship.season === season,
    );

    const teamMap = new Map<number, { id: number; label: string }>();
    for (const row of seasonRows) {
      for (const team of [row.game.team_a, row.game.team_b]) {
        if (team.club.id === player.club.id && !teamMap.has(team.id)) {
          teamMap.set(team.id, {
            id: team.id,
            label: this.buildTeamLabel(team),
          });
        }
      }
    }

    return {
      id: player.id,
      last_name: player.last_name,
      first_name: player.first_name,
      initials: this.buildInitials(player.first_name, player.last_name),
      club: { id: player.club.id, name: player.club.name },
      teams: [...teamMap.values()],
      season,
    };
  }

  private buildInitials(firstName: string, lastName: string): string {
    return (
      (firstName[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase()
    );
  }

  private buildTeamLabel(team: Team): string {
    const genderLabel = team.gender === Gender.MALE ? 'Masculin' : 'Féminin';
    return [team.category, genderLabel, team.suffix].filter(Boolean).join(' ');
  }
}
