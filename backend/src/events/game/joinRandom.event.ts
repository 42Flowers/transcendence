import { Socket } from "socket.io";
import { GameMode } from "src/game/game";

export class GameJoinRandomEvent {
	constructor(public socket: Socket, public gameMode: GameMode) {}
}
