import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {

	constructor(
		private readonly prismaService: PrismaService
	) {};

	async conversationExists(userId: number, targetId: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}, include : {userConversations: true}});
			console.log(user);
			user.userConversations.map((conv) => {
				if (conv.receiverId === targetId)
				{
					console.log(conv.conversationId);
					console.log(conv);
					return conv.conversationId;
				}
			});
			return null;
		} catch (err) {
			throw new Error(err.message);
		}
	}


	async createConversation(userId: number, targetId: number) : Promise<any> {
		try {
			const id : string = uuidv4();
			const conversation = await this.prismaService.conversation.create({
				data: {
					name : id
				}
			})
			if(conversation) {
				const conversation1 = await this.prismaService.userConversation.create({
					data: {
						user: {
							connect: {
								id: userId,
							},
						},
						conversation: {
							connect: {
								id : conversation.id,
							}
						},
						receiverId: targetId,
					}
				});
				const conversation2 = await this.prismaService.userConversation.create({
					data: {
						user: {
							connect: {
								id: targetId,
							}
						},
						conversation: {
							connect: {
								id: conversation.id,
							},
						},
						receiverId: userId,
					}
				});
				if (!conversation1 || !conversation2)
					return "coulnd't create user conversation."
				
			}
			return conversation
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async getConversationName(userId: number, destId: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where : {id: userId}, include : {userConversations: true}});
			let conversationId = undefined;
			user.userConversations.map((conv) => {
				if (conv.receiverId === destId) {
					conversationId = conv.conversationId;	
				}
			})
			if (conversationId !== undefined) {
				return await this.prismaService.conversation.findUnique({where: {id: conversationId}});
			}
			return null;
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async getConversationId(userId: number, destId: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where : {id : userId}, include : {userConversations:true}});
			let conversationId = undefined;
			user.userConversations.map((conv) => {
				if (conv.receiverId === destId) {
					return conv.conversationId;
				}
			});
			return null;
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async getAllUserConversations(userId: number) : Promise<any> {
		try {
			const conversations = await this.prismaService.user.findUnique({
				where: {
					id: userId,
				},
				include : {userConversations:true}
			});
			console.log(conversations.userConversations);
			console.log("coucou");
			return conversations.userConversations;
		} catch (err) {throw err}
	}
}
