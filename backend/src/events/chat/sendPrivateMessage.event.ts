import { StringChain } from "lodash";

export class ChatSendPrivateMessageEvent {
	constructor(public userId: number, public conversationName: string, public message: string, public sentAt: string, public options: string) {}
}