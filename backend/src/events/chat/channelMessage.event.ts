import { Socket } from "socket.io";

export class ChatChannelMessageEvent {
	constructor(public userId: number, public channelId: number, public message: string) {}
}