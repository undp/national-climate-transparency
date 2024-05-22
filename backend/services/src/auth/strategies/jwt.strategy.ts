import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from '../../dtos/jwt.payload';
import { UserState } from 'src/enums/user.state.enum';
import { UserService } from 'src/user/user.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private logger: Logger, private readonly userService: UserService,) {
        const secret = configService.get<string>('jwt.userSecret');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const jwtPayload: JWTPayload = plainToClass(JWTPayload, payload)
        const user = await this.userService.getUserCredentials(jwtPayload.un);
        if (user.state !== UserState.ACTIVE) {
            throw new UnauthorizedException('user deactivated');
        }
        return { id: jwtPayload.sub, companyName: jwtPayload.cn, role: jwtPayload.r, SubRole: jwtPayload.sr, name: jwtPayload.n, sector: jwtPayload.sc };
    }
}
