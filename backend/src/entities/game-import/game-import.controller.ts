import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@services/auth/jwt-auth.guard';
import { GameImportService } from './game-import.service';
import { ScoreSheetService } from '@services/score-sheet/score-sheet.service';

@Controller('game-imports')
export class GameImportController {
  constructor(
    private readonly scoreSheetService: ScoreSheetService,
    private readonly gameImportService: GameImportService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.gameImportService.findAll();
  }

  @Post(':id/retry')
  @UseGuards(JwtAuthGuard)
  @HttpCode(202)
  retry(@Param('id', ParseIntPipe) id: number) {
    return this.scoreSheetService.retry(id);
  }
}
