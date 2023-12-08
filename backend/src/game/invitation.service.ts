import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { GameInviteToNormal } from "src/events/game/inviteToNormalGame.event";
import { SocketService } from "src/socket/socket.service";
import { GameMode } from "./game";
import { GameJoinInvite } from "src/events/game/joinInvite.event";
import { PrismaService } from "src/prisma/prisma.service";
import { Interval } from "@nestjs/schedule";

type GameInvitation = {
    gameMode: GameMode;
    requestingUserId: number;
    invitedUserId: number;
    createdAt: number;
};

@Injectable()
export class InvitationService {
    private lastInvitationId: number;
    private pendingInvitations: Map<number, GameInvitation>;
    private invitations: number[];

    constructor(private readonly socketService: SocketService,
        private readonly prismaService: PrismaService) {

        this.lastInvitationId = 1;
        this.pendingInvitations = new Map<number, GameInvitation>();
        this.invitations = [];
    }

    private async createInvitation(requestingUserId: number, invitedUserId: number, gameMode: GameMode): Promise<number> {
        const invitationId = this.lastInvitationId++;

        const invitation: GameInvitation = {
            requestingUserId,
            invitedUserId,
            gameMode,
            createdAt: Date.now(),
        };

        this.pendingInvitations.set(invitationId, invitation);
        this.invitations.push(invitationId);

        const requestingUserInfo = await this.prismaService.user.findUnique({
            where: {
                id: requestingUserId,
            },
        });

        this.socketService.emitToUserSockets(invitedUserId, 'showGameInvite', requestingUserInfo?.pseudo);

        return invitationId;
    }

	private async checkBlockedUser(userAId: number, userBId: number): Promise<boolean> {
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

    async handleInvitation(requestingUserId: number, invitedUserId: number, gameMode: GameMode): Promise<void> {
        const isTargetOnline = this.socketService.isOnline(invitedUserId);
        const isBlocked = await this.checkBlockedUser(requestingUserId, invitedUserId);

        /* If the user is offline or blocked, silently discards the invitation */
        if (!isTargetOnline || isBlocked) {
            return ;
        }

        await this.createInvitation(requestingUserId, invitedUserId, gameMode);
    }

    @OnEvent('game.joinInvite')
	handleJoinInvite(event: GameJoinInvite) {
        console.log('the boy responded');
		// this.joinInviteGame(event.socket);
	}

	@OnEvent('game.inviteToNormal', { async: true, promisify: true })
	async handleInviteToNormal({ socket, targetId }: GameInviteToNormal) {
        await this.handleInvitation(socket.user.id, targetId, GameMode.Normal);
	}

    @Interval(10000)
    clearExpiredInvitations() {
        /**
         * This functions deleted invitations that exists for longer than 5 minutes
         */

        const EXPIRATION_TIMEOUT = 5 * 60 * 1000;
        const now = Date.now();

        while (this.invitations.length > 0) {
            const invitationId = this.invitations[0];
            const invitation = this.pendingInvitations.get(invitationId);
            const elapsedTime = now - invitation.createdAt;

            if (elapsedTime >= EXPIRATION_TIMEOUT) {
                this.invitations.splice(0, 1);
                this.pendingInvitations.delete(invitationId);
            } else {
                /**
                 * We break here we known that all further invitations are more recent than this one.
                 * Thus no need to check for expired invitations.
                 */
                break ;
            }
        }
    }
}