import { Socket } from "socket.io";

export class GameKeyUpEvent {
	constructor(public socket: Socket, public key: string) {}
}
