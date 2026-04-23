import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PayloadJwtDto } from '../../dto/jwt/payload.jwt.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CLAVE_SECRETA_TEMPORAL',
    });
  }

  validate(payload: PayloadJwtDto): PayloadJwtDto {
    return { userId: payload.sub, userName: payload.userName };
  }
}
