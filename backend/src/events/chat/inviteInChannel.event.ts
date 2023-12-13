export class ChatInviteInChannelEvent {
	constructor(public userId: number, public channelId: number, public targetName: string) {}
}