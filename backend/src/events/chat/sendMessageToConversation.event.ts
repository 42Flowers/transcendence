import { StringChain } from "lodash";

export class ChatSendMessageToConversationdEvent {
	constructor(public user1: number, public user2: number,
		public type: string,
		public id: number,
		public authorId: number, 
		public authorName: string, 
		public message: string, 
		public createdAt: Date,
		public msgId: number,
		) {}
}