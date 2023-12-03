import { Socket } from "socket.io";

export class GameKeyDownEvent {
	constructor(public socket: Socket, public key: string) {}
}
