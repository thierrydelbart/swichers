import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import Anthropic from '@anthropic-ai/sdk';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file/file.service';
import { GamePersistenceService } from '../game-persistence/game-persistence.service';
import { GameImportService } from '../game-import/game-import.service';
import { GameImportStatus } from '../game-import/game-import-status.enum';
import { parseFilename } from '../game-import/filename-parser';
import { ExtractionResult } from '../game-persistence/extraction-result.interface';
import { File } from '../file/file.entity';
import { SYSTEM_PROMPT } from './score-sheet.prompt';

const execFile = promisify(execFileCb);

@Injectable()
export class ScoreSheetService {
  private readonly logger = new Logger(ScoreSheetService.name);
  private readonly anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
    private readonly gamePersistenceService: GamePersistenceService,
    private readonly gameImportService: GameImportService,
  ) {}

  async extract(
    buffer: Buffer,
    originalName: string,
  ): Promise<{ import_id: number }> {
    let parsed: ReturnType<typeof parseFilename>;
    try {
      parsed = parseFilename(originalName);
    } catch {
      throw new BadRequestException('Invalid FFBB filename format');
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const existing = await this.fileService.findByHash(hash);
    if (existing) {
      throw new BadRequestException('Ce fichier a déjà été importé');
    }

    const uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ?? './uploads';
    const file = await this.fileService.persist(
      originalName,
      hash,
      uploadDir,
      buffer,
    );

    const gameImport = await this.gameImportService.create(
      originalName,
      parsed,
      file,
    );

    void this.runExtraction(gameImport.id, buffer, file);

    return { import_id: gameImport.id };
  }

  async retry(importId: number): Promise<void> {
    const gameImport = await this.gameImportService.findById(importId);
    if (!gameImport)
      throw new NotFoundException(`GameImport #${importId} not found`);
    if (gameImport.status !== GameImportStatus.FAILED) {
      throw new BadRequestException('Only failed imports can be retried');
    }
    if (!gameImport.file) {
      throw new BadRequestException('No file associated with this import');
    }
    const buffer = await fs.readFile(gameImport.file.location);
    void this.runExtraction(importId, buffer, gameImport.file);
  }

  async recoverPendingImports(): Promise<void> {
    const pending = await this.gameImportService.findAllPending();
    for (const gameImport of pending) {
      if (!gameImport.file) continue;
      try {
        const buffer = await fs.readFile(gameImport.file.location);
        void this.runExtraction(gameImport.id, buffer, gameImport.file);
      } catch {
        await this.gameImportService.updateStatus(
          gameImport.id,
          GameImportStatus.FAILED,
          { errorMessage: 'File missing from disk after server restart' },
        );
      }
    }
  }

  private async runExtraction(
    importId: number,
    buffer: Buffer,
    file: File,
  ): Promise<void> {
    await this.gameImportService.updateStatus(
      importId,
      GameImportStatus.PENDING,
      { extractedAt: new Date() },
    );

    try {
      const jpegBuffer = await this.convertPdfToJpeg(buffer, file.hash);
      const extractedData = await this.callClaude(jpegBuffer);
      await this.fileService.updateExtractedData(file.id, extractedData);
      const game = await this.gamePersistenceService.persist(
        extractedData,
        file,
      );
      await this.gameImportService.updateStatus(
        importId,
        GameImportStatus.READY,
        { game },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Extraction failed';
      await this.gameImportService.updateStatus(
        importId,
        GameImportStatus.FAILED,
        { errorMessage: message },
      );
    }
  }

  private async convertPdfToJpeg(
    pdfBuffer: Buffer,
    hash: string,
  ): Promise<Buffer> {
    const tmpDir = os.tmpdir();
    const pdfPath = path.join(tmpDir, `${hash}.pdf`);
    const outPrefix = path.join(tmpDir, `${hash}-out`);
    const jpegPath = `${outPrefix}.jpg`;

    try {
      await fs.writeFile(pdfPath, pdfBuffer);
      await execFile('pdftoppm', [
        '-r',
        '300',
        '-jpeg',
        '-singlefile',
        pdfPath,
        outPrefix,
      ]);
      return await fs.readFile(jpegPath);
    } catch {
      throw new BadRequestException('Invalid or unreadable PDF');
    } finally {
      await fs.unlink(pdfPath).catch(() => {});
      await fs.unlink(jpegPath).catch(() => {});
    }
  }

  private async callClaude(buffer: Buffer): Promise<ExtractionResult> {
    let text: string;
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: buffer.toString('base64'),
                },
              },
              {
                type: 'text',
                text: 'Extract the game data from this FFBB score sheet.',
              },
            ],
          },
        ],
      });
      const block = response.content[0];
      text = block.type === 'text' ? block.text : '';
    } catch {
      throw new BadGatewayException('Claude API call failed');
    }

    const jsonText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    try {
      return JSON.parse(jsonText) as ExtractionResult;
    } catch (e) {
      this.logger.error('Claude returned invalid JSON', jsonText, e);
      throw new BadGatewayException('Claude returned invalid JSON');
    }
  }
}
