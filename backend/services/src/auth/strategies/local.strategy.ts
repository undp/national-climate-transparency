import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const validationResponse: {user: Omit<User, 'password'> | null; message: string} = await this.authService.validateUser(username, password);
    if (!validationResponse.user) {
      throw new UnauthorizedException();
    }
    return validationResponse.user;
  }
}
