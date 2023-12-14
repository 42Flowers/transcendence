import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from "@nestjs/common";
import { MyError } from 'src/errors/errors';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConversationsService {

	constructor(
		private readonly prismaService: PrismaService
	) {};

	async conversationExistsFromId(convId: number) : Promise<any> {
        try {
            const conversation = await this.prismaService.conversation.findUnique({
                where: {
                    id: convId,
                }, select : {
                    id : true,
                    messages: true,
                    users : true
                }
            });
            return conversation;
        } catch (error) {
            throw new MyError(error.message);
        }
    }

	async conversationExists(userId: number, targetId: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}, select: {userConversations: true }});
			const userconversation = user.userConversations.find((conv) => conv.receiverId == targetId);
			if (userconversation == null)
				return null;
			const conversation = await this.prismaService.conversation.findUnique({where: {id: userconversation.conversationId}, select: {id: true, name: true}});
			if (conversation != null) {
				return conversation;
			}
			return null;
		} catch (err) {
			throw new Error(err.message);
		}
	}


	async createConversation(userId: number, targetId: number): Promise<any> {
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
			const target = await this.prismaService.user.findUniqueOrThrow({
				where: {
					id: targetId,
				},
				select: {
					pseudo: true,
					avatar: true,
				},
			});
			return {
				avatar: target.avatar,
				conversationId: conversation.id,
				targetId,
				targetName: target.pseudo,
			};
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async getConversationName(userId: number, destId: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where : {id: userId}, select : {userConversations: true}});
			let conversationId;
			user.userConversations.map((conv) => {
				if (conv.receiverId === destId) {
					conversationId = conv.conversationId;	
				}
			})
			if (conversationId !== undefined) {
				return await this.prismaService.conversation.findUnique({where: {id: conversationId}, select: {name: true}});
			}
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
			return conversations.userConversations;
		} catch (err) {
			throw err;
		}
	}
}
