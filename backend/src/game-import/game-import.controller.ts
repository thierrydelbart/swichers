import {
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScoreSheetService } from '../score-sheet/score-sheet.service';

@Controller('game-imports')
export class GameImportController {
  constructor(private readonly scoreSheetService: ScoreSheetService) {}

  @Post(':id/retry')
  @UseGuards(JwtAuthGuard)
  @HttpCode(202)
  retry(@Param('id', ParseIntPipe) id: number) {
    return this.scoreSheetService.retry(id);
  }
}
