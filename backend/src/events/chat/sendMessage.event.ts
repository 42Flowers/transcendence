import { StringChain } from "lodash";

export class ChatSendMessageEvent {
	constructor(public destination: string, 
		public type: string, 
		public id: number,
		public authorId: number, 
		public authorName: string, 
		public message: string, 
		public createdAt: Date,
		public channelUsers: { userId: number; }[],
		) {}
}