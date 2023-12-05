import { Socket } from "socket.io";

export class ChatChannelMessageEvent {
	constructor(public userId: number, public type: string, public to: string, public channelId: number, public message: string, public options: string) {}
}