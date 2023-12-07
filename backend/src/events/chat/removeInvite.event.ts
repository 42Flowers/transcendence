
export class ChatRemoveInviteEvent {
	constructor(public userId: number, public channelName: string, public channelId: number) {}
}