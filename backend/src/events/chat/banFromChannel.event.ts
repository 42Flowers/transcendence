
export class ChatBanFromChannelEvent {
	constructor(public userId: number, public channelName: string, public channelId: number, public targetId: number) {}
}