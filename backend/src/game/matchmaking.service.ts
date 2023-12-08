import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { GameCancelSearchEvent } from "src/events/game/cancelSearch.event";
import { GameJoinRandomEvent } from "src/events/game/joinRandom.event";
import { GameService } from "./game.service";
import { Socket } from "socket.io";
import { GameMode } from "./game";
import { SocketDisconnectedEvent } from "src/events/socket-disconnected.event";

@Injectable()
export class MatchmakingService {
    private queuedUsers: Set<number>;
    private randomQueue: Socket[];
    
    constructor(private readonly gameService: GameService) {
        this.queuedUsers = new Set<number>();
        this.randomQueue = [];
    }

    private joinQueue(socket: Socket, gameMode: number) {
        if (this.queuedUsers.has(socket.user.id))
            return ; /* User is already queued */

        if (0 === gameMode) {
            /* random queue */
            this.randomQueue.push(socket);
        
            while (this.randomQueue.length >= 2) {
                /* While we have a least two players, add them to a game */
                const [ leftPlayer, rightPlayer ] = this.randomQueue.splice(0, 2);

                this.queuedUsers.delete(leftPlayer.user.id);
                this.queuedUsers.delete(rightPlayer.user.id);

                this.gameService.createGame(leftPlayer, rightPlayer, GameMode.Normal);
            }
        }
    }

    private leaveQueue(socket: Socket) {
        const queueIndex = this.randomQueue.findIndex(e => e.id === socket.id);
        this.queuedUsers.delete(socket.user.id);

        if (queueIndex >= 0) {
            this.randomQueue.splice(queueIndex, 1);
        }
    }

	@OnEvent('game.joinRandom')
	handleJoinRandomGame({ socket, gameMode }: GameJoinRandomEvent) {
        if (this.gameService.isUserInGame(socket))
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