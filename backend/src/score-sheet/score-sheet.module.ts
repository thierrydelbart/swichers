import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { ScoreSheetController } from './score-sheet.controller';
import { ScoreSheetService } from './score-sheet.service';

@Module({
  imports: [FileModule],
  controllers: [ScoreSheetController],
  providers: [ScoreSheetService],
})
export class ScoreSheetModule {}
