import { Socket } from "socket.io";

export class ChatJoinChannelEvent {
    constructor(public userId: number, public channelName: string, public pwd: string) {}
}