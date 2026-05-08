import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { ScoreSheetController } from './score-sheet.controller';
import { ScoreSheetService } from './score-sheet.service';
import { GamePersistenceModule } from '../game-persistence/game-persistence.module';

@Module({
  imports: [FileModule, GamePersistenceModule],
  controllers: [ScoreSheetController],
  providers: [ScoreSheetService],
})
export class ScoreSheetModule {}
