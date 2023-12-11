import { Socket } from "socket.io";

export class SocketDisconnectedEvent {
    constructor(public readonly socket: Socket) {}
}
