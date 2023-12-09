import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessagesService {

	constructor(
		private readonly prismaService: PrismaService
	) {};

	async getMessagesfromChannel(userId: number, channelId: number): Promise<any> {
		try {
			const messages = await this.prismaService.message.findMany({
				where: {
					channelId: channelId
				}, select: {
					channelId: true,
					content:true,
					createdAt: true,
					id: true,
					authorId:true
				}
			});
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async getMessagesfromConversation(userId: number, friendId: number): Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}, include: {userConversations: true}});
			let conversationId = undefined;
			user.userConversations.map((conv) => {
				if (conv.receiverId === friendId) {
					conversationId = conv.conversationId;
				}
			});
			if (conversationId != undefined) {
				return await this.prismaService.privateMessage.findMany({where: {conversationId: conversationId}});
			}
			return undefined;
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async newChannelMessage(userId: number, channelId: number, message: any) : Promise<any> {
		try {
			const channel = await this.prismaService.channel.findUnique({
				where: 
				{id : channelId}, select: {id: true}});
			if (channel != null){
				return await this.prismaService.message.create({data: {
					authorId: userId,
					content: message,
					channelId: channel.id
				}})
			};
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async newPrivateMessage(userId: number, conversationId: number, message: string) : Promise<any> {
		try {
			const msg =  await this.prismaService.privateMessage.create({
				data: {
					authorId: userId,
					content: message,
					conversationId: conversationId
				}
			});
			return msg;
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async clearAllMessages(channelId: number) : Promise<any> {
		try {
			const deleted = await this.prismaService.message.deleteMany({where: {channelId : channelId}});
			return deleted;
		} catch (err) {
			throw new Error(err.message);
		}
	};
}
