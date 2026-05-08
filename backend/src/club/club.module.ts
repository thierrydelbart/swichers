import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './club.entity';
import { ClubService } from './club.service';

@Module({
  imports: [TypeOrmModule.forFeature([Club])],
  providers: [ClubService],
  exports: [ClubService],
})
export class ClubModule {}
