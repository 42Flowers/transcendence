import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ChatChannelMessageEvent2 } from 'src/events/chat/channelMessage2.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketService } from 'src/socket/socket.service';

export interface ChannelUser {
    id: number;

    avatar: string | null;

    pseudo: string;
}

@Injectable()
export class ChannelsService {
    constructor(private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly socketService: SocketService) {}

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

        this.eventEmitter.emit(ChatChannelMessageEvent2.EVENT_NAME,
            new ChatChannelMessageEvent2(message.id, userId, channelId, content));

        return message;
    }

    @OnEvent(ChatChannelMessageEvent2.EVENT_NAME)
    async handleChannelMessagePosted({ authorId, channelId, content, id }: ChatChannelMessageEvent2) {
        try {
            /* Retrieve all channel members */
            const members = await this.prismaService.channelMembership.findMany({
                where: {
                    channelId,
                },
            });

            const membersToNotify = members.filter(member => {
                /* TODO check notification options for this member */

                /**
                 * Just we don't send the notification to the user who posted the message,
                 * he already received the message data (id, content) as the POST request's reponse.
                 */
                if (member.userId === authorId)
                    return false;

                return true; /* For now everybody received the notification */
            });

            /* Dispatch a message to every connected user that is part of this channel */
            await Promise.all(membersToNotify.map(member => {

            }));
        } catch {

        }
    }
}