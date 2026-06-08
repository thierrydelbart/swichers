import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameImport } from './game-import.entity';
import { GameImportService } from './game-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameImport])],
  providers: [GameImportService],
  exports: [GameImportService],
})
export class GameImportModule {}
