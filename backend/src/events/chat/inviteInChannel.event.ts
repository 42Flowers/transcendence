
export class ChatInviteInChannelEvent {
	constructor(public userId: number, public channelId: number, public channelName: string, public targetId: number) {}
}