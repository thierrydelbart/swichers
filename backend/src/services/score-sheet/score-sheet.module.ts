import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '@entities/file/file.module';
import { GameImportModule } from '@entities/game-import/game-import.module';
import { GameImportController } from '@entities/game-import/game-import.controller';
import { ScoreSheetController } from './score-sheet.controller';
import { ScoreSheetService } from './score-sheet.service';
import { GamePersistenceModule } from '../game-persistence/game-persistence.module';

@Module({
  imports: [AuthModule, FileModule, GamePersistenceModule, GameImportModule],
  controllers: [ScoreSheetController, GameImportController],
  providers: [ScoreSheetService],
  exports: [ScoreSheetService],
})
export class ScoreSheetModule {}
