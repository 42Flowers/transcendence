import { Socket } from "socket.io";

export class GameJoinRandomEvent {
	constructor(public socket: Socket, public gameMode: number) {}
}
