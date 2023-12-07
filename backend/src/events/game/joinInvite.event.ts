import { Socket } from "socket.io";

export class GameJoinInvite {
	constructor(public socket: Socket) {}
}
