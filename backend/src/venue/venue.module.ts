import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './venue.entity';
import { VenueService } from './venue.service';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [VenueService],
  exports: [VenueService],
})
export class VenueModule {}
