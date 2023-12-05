
export class ChatAddInviteEvent {
	constructor(public userId: number, public channelName: string, public channelId: number) {}
}