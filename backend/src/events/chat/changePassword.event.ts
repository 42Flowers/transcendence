
export class ChatChangePasswordEvent {
	constructor(public userId: number, public channelId: number, public pwd: string) {}
}