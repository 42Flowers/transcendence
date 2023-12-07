
export class ChatSendToChannelEvent {
	constructor(public channelName: string, public type: string, public message: string) {}
}