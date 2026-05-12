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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file/file.service';
import { GamePersistenceService } from '../game-persistence/game-persistence.service';
import { ExtractionResult } from '../game-persistence/extraction-result.interface';
import { SYSTEM_PROMPT } from './score-sheet.prompt';

const execFile = promisify(execFileCb);

@Injectable()
export class ScoreSheetService {
  private readonly anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
    private readonly gamePersistenceService: GamePersistenceService,
  ) {}

  async extract(buffer: Buffer, originalName: string): Promise<object> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const existing = await this.fileService.findByHash(hash);

    if (existing?.extractedData) {
      await this.gamePersistenceService.persist(
        existing.extractedData,
        existing,
      );
      return existing.extractedData;
    }

    const uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ?? './uploads';
    const file =
      existing ??
      (await this.fileService.persist(originalName, hash, uploadDir, buffer));

    const jpegBuffer = await this.convertPdfToJpeg(buffer, hash);
    const extractedData = await this.callClaude(jpegBuffer);
    await this.fileService.updateExtractedData(file.id, extractedData);
    await this.gamePersistenceService.persist(extractedData, file);
    return extractedData;
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
        max_tokens: 4096,
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
    } catch {
      throw new BadGatewayException('Claude returned invalid JSON');
    }
  }
}
