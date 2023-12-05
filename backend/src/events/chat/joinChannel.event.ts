import { Socket } from "socket.io";

export class ChatJoinChannelEvent {
	constructor(public userId: number, public channelName: string, public channelId: number, public pwd: string) {}
}