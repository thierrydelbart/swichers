import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlayerService } from './player.service';

class RenamePlayerDto {
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
}
