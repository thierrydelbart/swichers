import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameImport } from './game-import.entity';
import { GameImportStatus } from './game-import-status.enum';
import { ParsedFilename } from './filename-parser';
import { File } from '../file/file.entity';
import { Game } from '../game/game.entity';

@Injectable()
export class GameImportService {
  constructor(
    @InjectRepository(GameImport)
    private readonly repo: Repository<GameImport>,
  ) {}

  async create(
    filename: string,
    parsed: ParsedFilename,
    file: File | null,
  ): Promise<GameImport> {
    return this.repo.save(
      this.repo.create({
        status: GameImportStatus.PENDING,
        filename,
        league_code: parsed.leagueCode,
        championship_code: parsed.championshipCode,
        group_name: parsed.groupName,
        game_number: parsed.gameNumber,
        game_name: parsed.gameName,
        file,
      }),
    );
  }

  async findById(id: number): Promise<GameImport | null> {
    return this.repo.findOne({ where: { id }, relations: ['file'] });
  }

  async updateStatus(
    id: number,
    status: GameImportStatus,
    opts?: { errorMessage?: string; game?: Game; extractionStartedAt?: Date },
  ): Promise<void> {
    const update: Partial<GameImport> = {
      status,
      error_message: opts?.errorMessage ?? null,
    };
    if (opts?.game !== undefined) update.game = opts.game;
    if (opts?.extractionStartedAt !== undefined)
      update.extraction_started_at = opts.extractionStartedAt;
    await this.repo.save({ id, ...update });
  }

  async findAllPending(): Promise<GameImport[]> {
    return this.repo.find({
      where: { status: GameImportStatus.PENDING },
      relations: ['file'],
    });
  }

  async findAll(): Promise<GameImport[]> {
    return this.repo.find({
      order: { created_at: 'DESC' },
      relations: ['game'],
    });
  }
}
