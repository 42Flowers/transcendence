import { Controller, Get, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelsService } from './channels.service';

@Controller({
    path: 'channels',
    version: '1',
})
@UseGuards(AuthGuard)
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @Get(':id/users')
    async getUsers(
        @Request() req: ExpressRequest,
        @Param('id', ParseIntPipe) channelId: number
    ) {
        const userId = Number(req.user.sub);
        const users = await this.channelsService.getChannelUsers(userId, channelId);
        
        return users;
    }

    @Get('/')
    async getChannels(
        @Request() req: ExpressRequest
    ) {
        const userId = Number(req.user.sub);
        const channels = await this.channelsService.getUserChannels(userId);

        return channels;
    }
}
