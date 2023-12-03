
export class ChatSendToClientEvent {
	constructor(public userId: number, public type : string, public data: string) {}
}