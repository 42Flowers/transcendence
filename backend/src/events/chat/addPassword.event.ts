
export class ChatAddPasswordEvent {
	constructor(public userId: number, public channelName: string, public channelId: number, public pwd: string) {}
}