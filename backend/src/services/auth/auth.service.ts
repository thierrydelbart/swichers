import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(password: string): Promise<{ access_token: string }> {
    const hash = this.configService.get<string>('ADMIN_PASSWORD_HASH') ?? '';
    const valid = await bcrypt.compare(password, hash);
    if (!valid) throw new UnauthorizedException('Invalid password');
    const access_token = this.jwtService.sign({ sub: 'admin' });
    return { access_token };
  }
}
