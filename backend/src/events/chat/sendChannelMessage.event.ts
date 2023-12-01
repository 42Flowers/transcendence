
export class ChatSendChannelMessageEvent {
	constructor(public userId: number, public channelName: string, public channelId: number, public message: string, public sentAt: string, public options: string) {}
}