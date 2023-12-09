
export class ChatMuteOnChannelEvent {
	constructor(public userId: number, public channelId: number, public targetId: number) {}
}