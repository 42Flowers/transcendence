/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * The user token payload directly extracted from the JWT token
 */
interface UserPayload {
    /**
     * The user ID as a string.
     */
    sub: string;
}

declare global {
    namespace Express {
        export interface Request {
            user?: UserPayload;
        }
    }
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
    
    private extractTokenFromHeader(request: Request) {
        const [ type, token ] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}