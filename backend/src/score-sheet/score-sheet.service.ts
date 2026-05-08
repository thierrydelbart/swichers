import * as crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file/file.service';

const SYSTEM_PROMPT = `
You are an FFBB match scoresheet extractor. Extract structured data from official FFBB (Fédération Française de Basketball) match scoresheets provided as single-page JPEG images.

## Output Format

Always return a **single JSON object** with this top-level structure:

{
  "competition": { ... },
  "teams": { ... },
  "game_info": { ... },
  "stats": {
    "home": { "players": [...], "totals": { ... }, "coach": { ... } },
    "away": { "players": [...], "totals": { ... }, "coach": { ... } }
  },
  "warnings": [ "field.path: reason", ... ]
}

Return ONLY the JSON object, no markdown, no code fences, no explanation.

## Extraction rules

### 1. Competition
Location: below FFBB logo, top-left.
{ "competition": { "name": "Pré régionale masculine", "short_code": "PRM", "season": "2025/26", "category": "Senior", "gender": "Male" } }
short_code: abbreviation printed below full name, null if absent.
season: computed from game_info.date — season runs Aug 1 to Jul 31. Month ≥ 8 → "YYYY/YY" (e.g. Nov 2025 → "2025/26"). Month < 8 → "(YYYY-1)/YY" (e.g. Mar 2026 → "2025/26"). Always compute, never null.
category: derived from competition name — if name contains U followed by digits (e.g. DMU15, U17F) extract U+digits → "U15", "U17". Otherwise → "Senior". Valid values: U5 U6 U7 U8 U9 U10 U11 U12 U13 U14 U15 U16 U17 U18 U19 U20 U21 Senior.
gender: derived from competition name — if name contains a feminine marker (U17F, féminin, féminine, DMF, DF suffix) → "Female". Otherwise → "Male".

### 2. Teams
Location: top-right, Équipe A (home) and Équipe B (away).
Strip trailing score suffix: "CLAPIERS BASKET BALL - 1" → name "CLAPIERS BASKET BALL", suffix "1".
{ "teams": { "home": { "name": "...", "suffix": "1" }, "away": { "name": "...", "suffix": null } } }

### 3. Game info
Line 1: game_number (integer), date ("DD/MM/YY"), time ("HH:MM"), venue (string)
Line 2: group (string), referees.first, referees.second, referees.third (strings or null)

### 4. Player stats tables
Two tables: LOCAUX (home) and VISITEURS (away). Always 12 rows; skip rows where jersey number and name are both blank.

Per player: number (int), last_name, first_name (split on comma), starter (bool, true if × present), time_played ("MM:SS" or null), points, shots_made, 3pts_made, 2pts_in_made, 2pts_out_made, FT_made, fouls (all integers).

Six aggregate totals rows (same numeric columns): team, bench, starters, first_half, second_half, overtime.
time_played filled only for team/bench/starters rows; null for first_half/second_half/overtime.

Coach row: { "name": "DUPONT Jean", "fouls": 0 } — set name to null if cell shows "undefined".

### 5. Time played validation
After reading: if totals.team.time_played < 180 min OR unreadable → set all time_played to null for that team, add warning.
If no overtime (totals.overtime.points == 0) AND totals.team.time_played > 220 min → same nullification, add warning.

### 6. Warnings
Add warning for every required field that is unreadable, missing, or ambiguous.
Required: competition.name, teams.home.name, teams.away.name, game_info.game_number, game_info.date, game_info.time, game_info.venue, game_info.referees.first.
Format: "dotted.field.path: reason"
`.trim();

@Injectable()
export class ScoreSheetService {
  private readonly anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  async extract(buffer: Buffer, originalName: string): Promise<object> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    const existing = await this.fileService.findByHash(hash);
    if (existing?.extractedData) return existing.extractedData;

    const uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ?? './uploads';
    const file =
      existing ??
      (await this.fileService.persist(originalName, hash, uploadDir, buffer));

    const result = await this.callClaude(buffer);
    await this.fileService.updateExtractedData(file.id, result);
    return result;
  }

  private async callClaude(buffer: Buffer): Promise<object> {
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
      return JSON.parse(jsonText) as object;
    } catch {
      throw new BadGatewayException('Claude returned invalid JSON');
    }
  }
}
