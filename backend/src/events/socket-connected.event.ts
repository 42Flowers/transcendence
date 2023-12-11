import { Socket } from "socket.io";

export class SocketConnectedEvent {
    constructor(public readonly socket: Socket) {}
}
