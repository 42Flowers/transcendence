import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserJoinedChannelEvent } from "src/events/channels/user-joined-channel.event";
import { UserLeftChannelEvent } from "src/events/channels/user-left-channel.event";
import { PrismaService } from "src/prisma/prisma.service";
import { SocketService } from "src/socket/socket.service";

@Injectable()
export class ChatEventsService {
    constructor(private readonly prismaService: PrismaService,
        private readonly socketService: SocketService) {}

    @OnEvent('user.left.channel', { async: true, promisify: true })
    async handleUserLeftChannel({ channelId, userId: kickedUserId }: UserLeftChannelEvent) {
        try {
            const memberships = await this.prismaService.channelMembership.findMany({
                where: {
                    channelId,
                },
                include: {
                    user: true,
                },
            });

            /* Notify every channel members that someone has been kicked so they can update their list of members */
            memberships.forEach(({ userId }) => {
                this.socketService.emitToUserSockets(userId, 'user.left.channel', {
                    channelId,
                    userId: kickedUserId,
                });
            });

            /* Notify the kicked user that he has been evicted from the channel */
            this.socketService.emitToUserSockets(kickedUserId, 'user.left.channel', {
                channelId,
                userId: kickedUserId,
            });
        } catch {
            ;
        }
    }

    @OnEvent('user.joined.channel', { promisify: true, async: true })
    async handleUserJoinedChannel({ channelId, userId: foreignUserId }: UserJoinedChannelEvent) {
        try {
            const members = await this.prismaService.channelMembership.findMany({
                where: {
                    channelId,
                },
            });

            const {  avatar, pseudo } = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: foreignUserId,
                },
            });

            /* Notify every members that someone has joined the channel (including the newcomer) */
            members.forEach(({ userId }) => {
                this.socketService.emitToUserSockets(userId, 'user.joined.channel', {
                    channelId,
                    userId: foreignUserId,
                    avatar,
                    pseudo,
                });
            });
        } catch {
            ;
        }
    }
}