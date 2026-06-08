import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from './league.entity';
import { LeagueService } from './league.service';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  providers: [LeagueService],
  exports: [LeagueService],
})
export class LeagueModule {}
