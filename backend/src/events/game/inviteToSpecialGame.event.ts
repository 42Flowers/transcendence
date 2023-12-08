import { Socket } from "socket.io";

export class GameInviteToSpecial {
	constructor(public socket: Socket, public targetId: number) {}
}
