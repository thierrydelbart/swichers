import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/user.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepository.count();
    if (count === 0) {
      await this.userRepository.save({ firstName: 'Thierry' });
    }
  }

  async getFirstName(): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: 1 } });
    return user?.firstName ?? 'World';
  }
}
