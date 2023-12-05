
export class ChatRemovePasswordEvent {
	constructor(public userId: number, public channelName: string, public channelId: number) {}
}