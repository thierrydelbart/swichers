import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Championship } from './championship.entity';
import { ChampionshipService } from './championship.service';

@Module({
  imports: [TypeOrmModule.forFeature([Championship])],
  providers: [ChampionshipService],
  exports: [ChampionshipService],
})
export class ChampionshipModule {}
