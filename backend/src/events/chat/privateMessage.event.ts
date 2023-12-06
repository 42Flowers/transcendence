
export class ChatPrivateMessageEvent {
	constructor(public userId: number, public targetId: number, public message: string ) {}
}