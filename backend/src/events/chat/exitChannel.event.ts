import { Socket } from "socket.io";

export class ChatExitChannelEvent {
	constructor(public curruser: any, public type: string, public to: string, public channelId: number, public message: string, public options: string) {}
}