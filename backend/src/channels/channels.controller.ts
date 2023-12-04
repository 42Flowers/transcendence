import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelsService } from './channels.service';
import { IsString } from 'class-validator';

export class PostChannelMessageDto {
    @IsString()
    content: string;
}

@Controller({
    path: 'channels',
    version: '1',
})
@UseGuards(AuthGuard)
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @Get('/:id/users')
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

    @Get('/:id/messages')
    async getMessages(
        @Request() req: ExpressRequest,
        @Param('id', ParseIntPipe) channelId: number
    ) {
        const userId = Number(req.user.sub);
        const messages = await this.channelsService.getChannelMessages(userId, channelId);

        return messages;
    }

    @Post('/:id/messages')
    async postMessage(
        @Request() req: ExpressRequest,
        @Param('id', ParseIntPipe) channelId: number,
        @Body(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true })) payload: PostChannelMessageDto
    ) {
        const { content } = payload;
        const userId = Number(req.user.sub);
        const message = await this.channelsService.postMessage(userId, channelId, content);

        return message;
    }
}
