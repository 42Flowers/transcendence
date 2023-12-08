import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { GameCancelSearchEvent } from "src/events/game/cancelSearch.event";
import { GameJoinRandomEvent } from "src/events/game/joinRandom.event";
import { GameService } from "./game.service";
import { Socket } from "socket.io";
import { GameMode } from "./game";

@Injectable()
export class MatchmakingService {
    private queuedSocketsIds: Set<string>;
    private randomQueue: Socket[];
    
    constructor(private readonly gameService: GameService) {

        this.queuedSocketsIds = new Set<string>();
        this.randomQueue = [];
    }

    private joinQueue(socket: Socket, gameMode: number) {
        if (this.queuedSocketsIds.has(socket.id))
            return ; /* User is already queued */

        if (0 === gameMode) {
            /* random queue */
            this.randomQueue.push(socket);
        
            while (this.randomQueue.length >= 2) {
                /* While we have a least two players, add them to a game */
                const [ leftPlayer, rightPlayer ] = this.randomQueue.splice(0, 2);

                this.queuedSocketsIds.delete(leftPlayer.id);
                this.queuedSocketsIds.delete(rightPlayer.id);

                this.gameService.createGame(leftPlayer, rightPlayer, GameMode.Normal);
            }
        }
    }

    private leaveQueue(socket: Socket) {

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
}