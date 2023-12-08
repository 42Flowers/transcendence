import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { GameInviteToNormal } from "src/events/game/inviteToNormalGame.event";
import { GameInviteToSpecial } from "src/events/game/inviteToSpecialGame.event";
import { GameJoinInvite } from "src/events/game/joinInvite.event";
import { GameMode } from "./game";
import { Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "./game.service";
import { SocketService } from "src/socket/socket.service";

@Injectable()
export class InvitationService {
    constructor(private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly socketService: SocketService,
        private readonly gameService: GameService) {}

	async checkBlockedUser(userAId: number, userBId: number): Promise<boolean> {
		const userAToB = await this.prismaService.blocked.findUnique({
			where: {
				userId_blockedId: {
					userId: userAId,
					blockedId: userBId,
				}
			}
		});

		const userBToA = await this.prismaService.blocked.findUnique({
			where: {
				userId_blockedId: {
					userId: userBId,
					blockedId: userAId,
				}
			}
		});

		if (userAToB || userBToA) {
			return true;
		}
		else {
			return false;
		}
	}

	async createInviteGame(socket: Socket, targetId: number, gameMode: GameMode) {
		if (this.gameService.isUserInGame(socket.user.id) || this.gameService.isUserInGame(targetId))
			return ;

		if (await this.checkBlockedUser(socket.user.id, targetId)) {
			return ;
		}

        const userData = await this.prismaService.user.findUnique({
			where: {
                id: socket.user.id,
			},
		});

		const targetUserData = await this.prismaService.user.findUnique({
			where: {
                id: targetId,
			},
		});

        const game = this.gameService.createInviteGame(userData, targetUserData, gameMode);
        game.attachLeftPlayerSocket(socket);

		this.socketService.emitToUserSockets(targetId, 'showGameInvite', socket.user.pseudo);
	}

	joinInviteGame(socket: Socket) {
        const game = this.gameService.findInvitedGame(socket.user.id);
        
        if (null !== game) {
            game.attachRightPlayerSocket(socket);
        }
	}
    
	@OnEvent('game.joinInvite')
	handleJoinInvite({ socket }: GameJoinInvite) {
		this.joinInviteGame(socket);
	}

	@OnEvent('game.inviteToNormal')
	handleInviteToNormal({ socket, targetId }: GameInviteToNormal) {
		this.createInviteGame(socket, targetId, GameMode.Normal);
	}

	@OnEvent('game.inviteToSpecial')
	handleInviteToSpecial({ socket, targetId }: GameInviteToSpecial) {
		this.createInviteGame(socket, targetId, GameMode.Special);
	}
}