import { Socket } from "socket.io";

export class ChatExitChannelEvent {
    constructor(public userId: number, public channelId: number) {}
}