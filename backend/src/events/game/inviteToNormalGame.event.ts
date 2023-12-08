import { Socket } from "socket.io";

export class GameInviteToNormal {
	constructor(public socket: Socket, public targetId: number) {}
}
