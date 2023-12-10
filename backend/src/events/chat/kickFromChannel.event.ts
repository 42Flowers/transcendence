
export class ChatKickFromChannelEvent {
	constructor(public userId: number, public channelId: number, public targetId: number) {}
}