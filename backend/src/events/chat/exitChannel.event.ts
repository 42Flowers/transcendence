import { Socket } from "socket.io";

export class ChatExitChannelEvent {
	constructor(public userId: number, public channelName: string, public channelId: number) {}
}