import { Controller, Post, Body, Get, UseGuards, Request, ParseIntPipe, Param } from '@nestjs/common';
import { RoomService } from '../rooms/DBrooms.service';
import { ChatService } from './DBchat.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { UsersService } from 'src/users_chat/DBusers.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';

interface convMessage {
    authorName: string,
    creationTime: Date,
    content: string,
}

interface channelElem {
    channelId: number,
    channelName: string,
    userPermissionMask: number,
}

interface privMessageElem {
    targetId: number,
    targetName: string,
}

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {

    constructor(
        private readonly roomService: RoomService,
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
		private readonly conversationService: ConversationsService,
		private readonly messageService : MessagesService
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
			const chans : channelElem[] = [];
			rooms.forEach(room => chans.push({channelId: room.channelId, channelName: room.channelName, userPermissionMask: room.permissionMask}));
			return chans;
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
		const channel = await this.messageService.getMessagesfromChannel(Number(req.user.sub), 1);
		console.log(channel);
		const messages: convMessage[] = [];
		const userNames = await Promise.all(channel.map(conv => this.userService.getUserName(conv.authorId)));
		channel.map((chan) => {
			userNames.forEach(name => messages.push({authorName: name.pseudo, content: chan.content, creationTime: chan.createdAt}));
		});
		return messages;
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('join-channel')
	async joinChannel(
		@Request() req : ExpressRequest
	) {
		try {
			// console.log(await this.chatService.chatRoom(data));
			const join = await this.chatService.chatRoom({userId: 3, type: 'join', roomname: 'chan1', roomId: 2, option: ''});
			console.log(join);
			return 'worked';
		} catch (err) {
			console.log(err.message);
		}
	}

	/**
	 * return id conversation et nom de la personne avec qui je discute
	 */
	@Get('get-conversations')
    async getPrivateConversations(
        @Request() req: ExpressRequest
    ) {
        try {
            // const conversations = await this.conversationService.getAllUserConversations(Number(req.user.sub));
            const conversations = await this.conversationService.getAllUserConversations(1);

            const convs: privMessageElem[] = []
            const userNames = await Promise.all(conversations.map(conv => this.userService.getUserName(conv.receiverId)));
			console.log(userNames);
			conversations.map((conv, index) => {
				convs.push({targetId: conv.receiverId, targetName: userNames[index].pseudo});
			});
			console.log("la conversations: ", conversations, " \n et ici convs ", convs);
            return convs;
        } catch (err) {
			console.log(err.message);
        }
    }

	@Get('private-conv')
	async privateConversation(
		@Request() req: ExpressRequest
	) {
		try {
			const conversations = await this.chatService.getPrivateConversation(Number(req.user.sub), 1);
			const messages: convMessage[] = [];
			conversations.forEach(msg => messages.push({authorName: msg.authorId, content: msg.content, creationTime: msg.createdAt}));
			return messages;
		} catch (err) {
			console.log(err.message);
		}
	}

	@Get('get-friends')
	async getFriends(
		@Request() req: ExpressRequest
	) {
		try {
			const friends = await this.userService.getFriends(Number(req.user.sub));
			console.log(friends);
			console.log("test");
			return friends;
		} catch (err) {console.log(err.message)}
	}
}
