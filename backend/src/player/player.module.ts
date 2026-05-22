import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Player } from './player.entity';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), AuthModule],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
