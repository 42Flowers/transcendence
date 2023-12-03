import { Socket } from "socket.io";

export class GameCancelSearchEvent {
	constructor(public socket: Socket) {}
}
