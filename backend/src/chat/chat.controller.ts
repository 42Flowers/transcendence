import { Controller, Post, Body, Get, UseGuards, Request, ParseIntPipe, Param } from '@nestjs/common';
import { RoomService } from '../rooms/DBrooms.service';
import { ChatService } from './DBchat.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { UsersService } from 'src/users_chat/DBusers.service';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { ConversationsService } from 'src/conversations/conversations.service';

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {

    constructor(
        private readonly roomService: RoomService,
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
		private readonly conversationService: ConversationsService
		) {}

    /**
     * @returns list of channels the user can join, nom du channel, le channelId et les permissions que le user en question a dans le channel
     */
    @Get('get-channels')
    async getChannels( 
		@Request() req: ExpressRequest
	) {
		try {
			const rooms = await this.roomService.getPublicRooms(Number(req.user.sub));
			return rooms;
		} catch (error) {
			console.log(error.message);
		}
    }

	/**
	 * return : toutes les informations sur le channel, type messages, users et tout ça
	 */
	@Get('get-channel')
	async getChannelContext(
		@Request() req: ExpressRequest
	) {
		try {

		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('join-channel')
	async joinChannel(
		@Body() data: {userId: number, type: string, roomname: string, roomId: number, option: any}
	) {
		try {
			// console.log(await this.chatService.chatRoom(data));
			console.log(await this.chatService.chatRoom({userId: 2, type: 'join', roomname: 'chan', roomId: 1, option: ''}));
			return 'worked';
		} catch (err) {
			console.log(err.message);
		}
	}


	/**
	 * return id conversation et nom de la personne avec qui je discute
	 */
	// @Get('get-conversations')
	// async getPrivateConversations(
	// 	@Request() req: ExpressRequest
	// ) {
	// 	try {
	// 		const conversations = await this.conversationService.getAllUserConversations(Number(req.user.sub));
	// 		const convs = [];
	// 		conversations.map((conv) => {
	// 			const name = await this.userService.getUserName(conv.receiverId);
	// 			convs.push({targetId: conv.receiverId, targetName: name});
	// 		})
	// 		return convs;
	// 		// return conversations;
	// 	} catch (err) {

	// 	}
	// }

	@Get('get-conversations')
    async getPrivateConversations(
        @Request() req: ExpressRequest
    ) {
        try {
            const conversations = await this.conversationService.getAllUserConversations(Number(req.user.sub));
            const convs = [];

            const userNames = await Promise.all(conversations.map(conv => this.userService.getUserName(conv.receiverId)));

			conversations.map((conv) => {
				userNames.forEach(name => convs.push({targetId: conv.receiverId, targetName: name.pseudo}));
			})
            return convs;
        } catch (err) {
			console.log(err.message);
        }
    }

	@Get('private-conv')
	async privateConversation(
		@Body() data: {userId: number, targetId: number}
	) {
		try {
			const conversations = await this.chatService.getPrivateConversation(data.userId, data.targetId);
			console.log(conversations);
		} catch (err) {
			console.log(err.message);
		}
	}

	@Get('get-friends')
	async getFriends(
		@Body() userId: number
	) {
		try {this.userService.getFriends(userId)}
		catch (err) {console.log(err.message)}
	}

    // /**
    //  * @param {User} user
    //  * @param {string} friend
    //  * @return all messages from the private conversation between two users.
    //  */
    // @Get('friend-conv')
    // async friendMessages(
	// 	@Body() data: {curruser: any, friendId: number}
	// ) {
	// 	// const user = this.userService.getUserById() //! ici il faut retrouver le user avec le token
	// 	const user = await this.userService.getUserById(data.curruser.id)
    //     return this.messagesService.getMessagesfromConversation(user, data.friendId);
    // }
}
