
export class ChatBanFromChannelEvent {
	constructor(public userId: number, public channelId: number, public targetId: number) {}
}