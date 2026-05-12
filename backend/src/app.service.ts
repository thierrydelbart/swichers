import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './user/user.entity';
import { Championship } from './championship/championship.entity';
import { LeagueService } from './league/league.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Championship)
    private readonly championshipRepository: Repository<Championship>,
    private readonly leagueService: LeagueService,
  ) {}

  async onModuleInit() {
    const count = await this.userRepository.count();
    if (count === 0) {
      await this.userRepository.save({ firstName: 'Thierry' });
    }

    const league = await this.leagueService.findOrCreate('0034');
    await this.championshipRepository
      .createQueryBuilder()
      .update()
      .set({ league })
      .where({ league: IsNull() })
      .execute();
  }

  async getFirstName(): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: 1 } });
    return user?.firstName ?? 'World';
  }
}
