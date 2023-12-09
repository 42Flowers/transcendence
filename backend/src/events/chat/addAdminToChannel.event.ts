
export class ChatAddAdminToChannelEvent {
	constructor(public userId: number, public channelId: number, public targetId: number) {}
}