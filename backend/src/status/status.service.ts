import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { forEach } from "lodash";
import { SocketConnectedEvent } from "src/events/socket-connected.event";
import { SocketDisconnectedEvent } from "src/events/socket-disconnected.event";
import { GameService } from "src/game/game.service";
import { PrismaService } from "src/prisma/prisma.service";
import { SocketService } from "src/socket/socket.service";

@Injectable()
export class StatusService {
    private playerStatusList: Record<number, string>;

    constructor(private readonly socketService: SocketService,
        private readonly prismaService: PrismaService,
        private readonly gameService: GameService) {

        this.playerStatusList = {};
    }

    private async playerStatusChange(userId: number, status: string) {
        let previousStatus = 'offline';

        if (userId in this.playerStatusList) {
            previousStatus = this.playerStatusList[userId];
        }

        if (previousStatus !== status) {
            if (status === 'offline') {
                if (userId in this.playerStatusList) {
                    delete this.playerStatusList[userId];
                }
            } else {
                this.playerStatusList[userId] = status;
            }

            await this.dispatchStatusChangeEvent(userId, status);
        }
    }

    private async dispatchStatusChangeEvent(userId: number, status: string) {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId,
                },
                select: {
                    pseudo: true,
                    friends: {
                        select: {
                            friend: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
            });

            forEach(user.friends, ({ friend }) => {
                this.socketService.emitToUserSockets(friend.id, 'status', {
                    userId,
                    username: user.pseudo,
                    status,
                });
            });
        } catch {
            ;
        }
    }

    private async updatePlayerStatus(userId: number) {
        try {
            const userSockets = this.socketService.getSockets(userId);
            const userInGame = this.gameService.isUserInGame(userId);

            let newStatus = '';
        
            /* First socket to connect */
            if (userInGame) {
                newStatus = 'ingame';
            } else if (userSockets.length >= 1) {
                newStatus = 'online';
            } else {
                newStatus = 'offline';
            }

            /* If the user disconnects but is still in a game, we display the status as ingame even though he's offline */
            /* Thats because the game continues */
            this.playerStatusChange(userId, newStatus);
        } catch {
            ;
        }
    }

    @OnEvent('game.joined', { async: true, promisify: true })
    async handleGameJoined(userId: number) {
        await this.updatePlayerStatus(userId);
    }

    @OnEvent('game.leaved', { async: true, promisify: true })
    async handleGameLeaved(userId: number) {
        await this.updatePlayerStatus(userId);
    }

    @OnEvent('socket.connected', { async: true, promisify: true })
    async handleSocketConnected({ socket }: SocketConnectedEvent) {
        await this.updatePlayerStatus(socket.user.id);
    }

    @OnEvent('socket.disconnected', { async: true, promisify: true })
    async handleSocketDisconnected({ socket }: SocketDisconnectedEvent) {
        await this.updatePlayerStatus(socket.user.id);        
    }
}