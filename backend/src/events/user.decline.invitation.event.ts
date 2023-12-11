import { Socket } from "socket.io";

export class UserDeclineGameInvitation {
    constructor(public readonly socket: Socket) {}
} 