
export class ChatUnBanFromChannelEvent {
	constructor(public userId: number, public channelId: number, public targetId: number) {}
}