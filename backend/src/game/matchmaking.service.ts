import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { GameCancelSearchEvent } from "src/events/game/cancelSearch.event";
import { GameJoinRandomEvent } from "src/events/game/joinRandom.event";
import { GameService } from "./game.service";
import { Socket } from "socket.io";
import { GameMode } from "./game";
import { SocketDisconnectedEvent } from "src/events/socket-disconnected.event";
import { User } from "@prisma/client";

@Injectable()
export class MatchmakingService {
    private queuedUsers: Set<number>;
    private randomQueue: Socket[];
    private specialQueue: Socket[];
    
    constructor(private readonly gameService: GameService) {
        this.queuedUsers = new Set<number>();
        this.randomQueue = [];
        this.specialQueue = [];
    }

    private joinQueue(socket: Socket, gameMode: GameMode) {
        if (this.queuedUsers.has(socket.user.id))
            return ; /* User is already queued */

        /* random queue */
        if (GameMode.Normal === gameMode) {
            this.randomQueue.push(socket);
        
            while (this.randomQueue.length >= 2) {
                /* While we have a least two players, add them to a game */
                const [ leftPlayer, rightPlayer ] = this.randomQueue.splice(0, 2);

                this.queuedUsers.delete(leftPlayer.user.id);
                this.queuedUsers.delete(rightPlayer.user.id);

                /** TODO Ugly typing hack */
                const game = this.gameService.createRandomGame(leftPlayer.user as any as User, rightPlayer.user as any as User, GameMode.Normal);

                game.attachLeftPlayerSocket(leftPlayer);
                game.attachRightPlayerSocket(rightPlayer);
            }
        }

        /* special queue */
        if (GameMode.Special === gameMode) {
            this.specialQueue.push(socket);
            
            while (this.specialQueue.length >= 2) {
                /* While we have a least two players, add them to a game */
                const [ leftPlayer, rightPlayer ] = this.specialQueue.splice(0, 2);

                this.queuedUsers.delete(leftPlayer.user.id);
                this.queuedUsers.delete(rightPlayer.user.id);

                /** TODO Ugly typing hack */
                const game = this.gameService.createRandomGame(leftPlayer.user as any as User, rightPlayer.user as any as User, GameMode.Special);

                game.attachLeftPlayerSocket(leftPlayer);
                game.attachRightPlayerSocket(rightPlayer);
            }
        }
    }

    private leaveQueue(socket: Socket) {
        const normalQueueIndex = this.randomQueue.findIndex(e => e.id === socket.id);
        const specialQueueIndex = this.specialQueue.findIndex(e => e.id === socket.id);
        this.queuedUsers.delete(socket.user.id);

        if (normalQueueIndex >= 0) {
            this.randomQueue.splice(normalQueueIndex, 1);
        }

        if (specialQueueIndex >= 0) {
            this.specialQueue.splice(specialQueueIndex, 1);
        }
    }

	@OnEvent('game.joinRandom')
	handleJoinRandomGame({ socket, gameMode }: GameJoinRandomEvent) {
        if (this.gameService.isUserInGame(socket.user.id))
            return ; // User is already is a game
        
        this.joinQueue(socket, gameMode);
    }

	@OnEvent('game.cancelSearch')
	handleCancelSearch({ socket }: GameCancelSearchEvent) {
        this.leaveQueue(socket);
    }

    @OnEvent('socket.disconnected')
    handleSocketDisconnected({ socket }: SocketDisconnectedEvent) {
        this.leaveQueue(socket);
    }
}