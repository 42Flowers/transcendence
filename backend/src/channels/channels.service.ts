import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ChannelUser {
    id: number;

    avatar: string | null;

    pseudo: string;
}

@Injectable()
export class ChannelsService {
    constructor(private readonly prismaService: PrismaService) {}

    async getChannelUsers(userId: number, channelId: number): Promise<ChannelUser[]> {
        const channel = await this.prismaService.channel.findUnique({
            where: {
                id: channelId,
            },
        });

        if (!channel) {
            throw new NotFoundException();
        }

        const users = await this.prismaService.channelMembership.findMany({
            where: {
                channelId,
            },
            select: {
                user: {
                    select: {
                        pseudo: true,
                        avatar: true,
                        id: true,
                    },
                }
            }
        });

        const userBelongsInChannel = users.findIndex(({ user: { id }}) => id === userId) >= 0;

        if (!userBelongsInChannel) {
            throw new NotFoundException();
        }

        return users.map(({ user }) => user);
    }

    async getUserChannels(userId: number) {
        const memberships = await this.prismaService.channelMembership.findMany({
            where: {
                userId,
            },
            select: {
                channel: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });

        return memberships.map(({ channel }) => channel);
    }

    async getChannelMessages(userId, channelId) {
        const messages = await this.prismaService.message.findMany({
            where: {
                channelId,
            },
            select: {
                author: {
                    select: {
                        pseudo: true,
                        id: true,
                        avatar: true,
                    },
                },
                content: true,
                id: true,
                createdAt: true,
            },
        });

        /* TODO check user to channel membership */

        return messages;
    }

    async postMessage(userId: number, channelId: number, content: string) {
        const message = await this.prismaService.message.create({
            data: {
                content,
                author: {
                    connect: {
                        id: userId,
                    },
                },
                channel: {
                    connect: {
                        id: channelId,
                    },
                },
            },
            select: {
                author: {
                    select: {
                        pseudo: true,
                        id: true,
                        avatar: true,
                    },
                },
                content: true,
                id: true,
                createdAt: true,
            }
        });

        return message;
    }
}