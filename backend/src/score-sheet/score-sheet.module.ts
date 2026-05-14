import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { ScoreSheetController } from './score-sheet.controller';
import { ScoreSheetService } from './score-sheet.service';
import { GamePersistenceModule } from '../game-persistence/game-persistence.module';

@Module({
  imports: [AuthModule, FileModule, GamePersistenceModule],
  controllers: [ScoreSheetController],
  providers: [ScoreSheetService],
})
export class ScoreSheetModule {}
