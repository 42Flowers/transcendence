import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { PrismaService } from 'src/prisma/prisma.service';
import { Request as ExpressRequest } from 'express';

@Controller({
    version: '1',
    path: '/users',
})
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private prismaService: PrismaService) {}

    @Get('/@me')
    async retrieveSelfProfile(@Request() req: ExpressRequest) {
        const user = await this.prismaService.user.findFirst({
            where: {
                id: parseInt(req.user!.sub),
            },
            select: {
                id: true,
                pseudo: true,
                avatar: true,
                email: true,
            },
        });

        return user;
    }
}
