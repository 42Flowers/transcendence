
export class ChatSendRoomToClientEvent {
	constructor(public userId: number, public type : string, public channel: any) {}
}