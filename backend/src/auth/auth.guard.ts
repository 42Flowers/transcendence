/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserPayload } from './user.payload';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { AllowIncompleteProfile } from './allow-incomplete-profile.decorator';

declare global {
    namespace Express {
        export interface Request {
            user?: UserPayload;
        }
    }
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService,
                private readonly prismaService: PrismaService,
                private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token was not provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync<UserPayload>(token);

            try {
                const userPayload = await this.prismaService.user.findUniqueOrThrow({
                    where: {
                        id: Number(payload.sub),
                    },
                    select: {
                        id: true,
                        pseudo: true,
                    },
                });

                if (null === userPayload.pseudo) {
                    const decorator = this.reflector.get(AllowIncompleteProfile, context.getHandler());

                    /**
                     * Checks for the presence of the @AllowIncompleteProfile decorator
                     */
                    if (undefined === decorator) {
                        throw new ForbiddenException('The user has an incomplete profile');
                    }
                }

                request['user'] = {
                    ...payload,
                    ...userPayload,
                };
            } catch (e) {
                if (e instanceof HttpException) {
                    throw e;
                }
                throw new NotFoundException();
            }
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new UnauthorizedException('Invalid JWT token');
        }
        return true;
    }
    
    private extractTokenFromHeader(request: Request) {
        const [ type, token ] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
