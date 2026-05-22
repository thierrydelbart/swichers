import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlayerService } from './player.service';

class RenamePlayerDto {
  last_name: string;
  first_name: string;
}

class MergePlayersDto {
  survivor_id: number;
  absorbed_ids: number[];
  last_name: string;
  first_name: string;
}

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  rename(@Param('id', ParseIntPipe) id: number, @Body() body: RenamePlayerDto) {
    return this.playerService.rename(id, body.last_name, body.first_name);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  merge(@Body() body: MergePlayersDto) {
    return this.playerService.merge(
      body.survivor_id,
      body.absorbed_ids,
      body.last_name,
      body.first_name,
    );
  }
}
