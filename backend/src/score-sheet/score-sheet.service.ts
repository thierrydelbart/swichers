import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoreSheetService {
  extract(buffer: Buffer): { received: boolean; size: number } {
    return { received: true, size: buffer.length };
  }
}
