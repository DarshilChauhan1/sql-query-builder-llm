import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class JwtAuthService {
    constructor(private readonly jwtService: JwtService) {}

    async generateTokens(payload : any) {
        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1d' });
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        return {
            accessToken,
            refreshToken
        };
    }
}
