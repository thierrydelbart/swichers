import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coach } from './coach.entity';
import { CoachService } from './coach.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coach])],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
