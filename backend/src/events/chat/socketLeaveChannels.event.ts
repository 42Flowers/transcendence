import { Socket } from "socket.io";

export class ChatSocketLeaveChannelsEvent {
	constructor(public userId: number, public client: Socket) {}
}