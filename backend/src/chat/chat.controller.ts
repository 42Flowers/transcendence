import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { RoomService } from '../rooms/DBrooms.service';
import { ChatService } from './DBchat.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {

    constructor(
        private readonly roomService: RoomService,
		private readonly chatService: ChatService
    ) {}

    /**
     * @returns list of channels the user can join
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

	@Post('join-channel')
	async joinChannel(
		@Body() data: {userId: number, type: string, roomname: string, roomId: number, option: any}
	) {
		try {
			console.log(await this.chatService.chatRoom(data));
			return 'worked';
		} catch (err) {
			console.log(err.message);
		}
	}

	@Get('private-conv')
	async privateMessages(
		@Body() data: {userId: number, targetId: number}
	) {
		try {
			console.log('passe ici');
			const conversations = await this.chatService.getPrivateConversations(data.userId, data.targetId);
			return conversations;
		} catch (err) {
			console.log(err.message);
		}
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
