
export class ChatUnMuteOnChannelEvent {
	constructor(public userId: number, public channelId: number, public targetId: number) {}
}