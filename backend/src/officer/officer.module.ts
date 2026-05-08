import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Officer } from './officer.entity';
import { OfficerService } from './officer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Officer])],
  providers: [OfficerService],
  exports: [OfficerService],
})
export class OfficerModule {}
