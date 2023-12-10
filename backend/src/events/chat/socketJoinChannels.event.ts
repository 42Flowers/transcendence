import { Socket } from "socket.io";

export class ChatSocketJoinChannelsEvent {
	constructor(public userId: number, public client: Socket) {}
}