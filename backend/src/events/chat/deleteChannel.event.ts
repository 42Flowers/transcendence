
export class ChatDeleteChannelEvent {
	constructor(public userId: number, public channelName: string, public channelId: number) {}
}