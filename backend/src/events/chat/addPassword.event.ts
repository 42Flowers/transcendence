
export class ChatAddPasswordEvent {
	constructor(public userId: number, public channelId: number, public pwd: string) {}
}