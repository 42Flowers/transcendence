import { Controller, Post, Body, Get, UseGuards, Request, ParseIntPipe, Param } from '@nestjs/common';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users_chat/DBusers.service';
import { RoomService } from '../rooms/DBrooms.service';
import { Request as ExpressRequest } from 'express';
import { ChatService } from './DBchat.service';
import { AuthGuard } from '../auth/auth.guard';
import { Prisma } from '@prisma/client';

// interface convMessage {
//     authorName: string,
//     creationTime: Date,
//     content: string,
// }

// interface channelElem {
//     channelId: number,
//     channelName: string,
//     userPermissionMask: number,
// }

// interface privMessageElem {
//     targetId: number,
//     targetName: string,
// }

interface convElem {
    isChannel: boolean,
    channelId?: number,
    channelName?: string,
    targetId?: number
    targetName?: string,
    userPermissionMask?: number,
    messages: convMessage[],
}

interface convMessage {
    authorName: string,
    authorId: number,
    creationTime: Date,
    content: string,
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

    // /**
    //  * @returns list of channels the user can join, nom du channel, le channelId et les permissions que le user en question a dans le channel
    //  */
    // @Get('get-channels')
    // async getChannels( 
	// 	@Request() req: ExpressRequest
	// ) {
	// 	try {
	// 		const rooms = await this.roomService.getPublicRooms(Number(req.user.sub));
	// 		const chans : channelElem[] = [];
	// 		rooms.forEach(room => chans.push({channelId: room.channelId, channelName: room.channelName, userPermissionMask: room.permissionMask}));
	// 		return chans;
	// 	} catch (error) {
	// 		console.log(error.message);
	// 	}
    // }

	// /**
	//  * return : toutes les informations sur le channel, type messages, users et tout ça
	//  */
	// @Get('get-channelmessages')
	// async getChannelContext(
	// 	@Request() req: ExpressRequest
	// ) {
	// 	try {
	// 	const channel = await this.messageService.getMessagesfromChannel(Number(req.user.sub), 1);
	// 	console.log(channel);
	// 	const messages: convMessage[] = [];
	// 	const userNames = await Promise.all(channel.map(conv => this.userService.getUserName(conv.authorId)));
	// 	channel.map((chan) => {
	// 		userNames.forEach(name => messages.push({authorName: name.pseudo, content: chan.content, creationTime: chan.createdAt}));
	// 	});
	// 	return messages;
	// 	} catch (err) {
	// 		console.log(err.message);
	// 	}
	// }

	@Post('join-channel')
	async joinChannel(
		@Request() req : ExpressRequest
	) {
		try {
			// console.log(await this.chatService.chatRoom(data));
			const join = await this.chatService.chatRoom({userId: 6, type: 'join', roomname: 'chan3', roomId: 4, option: {invite: false, key: false, value: ""}});
			return 'worked'; //Qu'est ce qu'il faut que je renvoie comme valeur ?
		} catch (err) {
			console.log(err.message);
		}
	}

	// @Get('exit-channel')
	// async exitChannel(
	// 	@Request() req : ExpressRequest
	// ) {
	// 	try {
	// 		this.eventEmitter
	// 	} catch(err) {
	// 		console.log(err.message);
	// 	}
	// }

	/**
	 * return id conversation et nom de la personne avec qui je discute
	 */
	// @Get('get-conversations')
    // async getPrivateConversations(
    //     @Request() req: ExpressRequest
    // ) {
    //     try {
    //         // const conversations = await this.conversationService.getAllUserConversations(Number(req.user.sub));
    //         const conversations = await this.conversationService.getAllUserConversations(1);

    //         const convs: privMessageElem[] = []
    //         const userNames = await Promise.all(conversations.map(conv => this.userService.getUserName(conv.receiverId)));
	// 		conversations.map((conv, index) => {
	// 			convs.push({targetId: conv.receiverId, targetName: userNames[index].pseudo});
	// 		});
	// 		console.log("la conversations: ", conversations, " \n et ici convs ", convs);
    //         return convs;
    //     } catch (err) {
	// 		console.log(err.message);
    //     }
    // }

	// @Get('get-privatemessages')
	// async privateConversation(
	// 	@Request() req: ExpressRequest
	// ) {
	// 	try {
	// 		const conversations = await this.chatService.getPrivateConversation(Number(req.user.sub), 1);
	// 		const messages: convMessage[] = [];
	// 		conversations.forEach(msg => messages.push({authorName: msg.authorId, content: msg.content, creationTime: msg.createdAt}));
	// 		return messages;
	// 	} catch (err) {
	// 		console.log(err.message);
	// 	}
	// }

	@Get('get-friends')
	async getFriends(
		@Request() req: ExpressRequest
	) {
		try {
			const friends = await this.userService.getFriends(Number(req.user.sub));
			console.log(friends);
			return friends;
		} catch (err) {console.log(err.message)}
	}

	@Get('get-chat')
	async getChat(
		@Request() req : ExpressRequest
	) {
		try {
			const chat : convElem[] = [];
			// const privmsg : convMessage[] = [];
			// const conversations = await this.conversationService.getAllUserConversations(1);
			// const userNames = await Promise.all(conversations.map(conv => this.userService.getUserName(conv.receiverId)));
			// const convMessages = await Promise.all(conversations.map(conv => this.chatService.getPrivateConversation(Number(req.user.sub), conv.receiverId)));
			// convMessages.map((msg, index) => privmsg.push({authorName: msg.authorName, authorId: msg.authorId, creationTime: msg.createdAt, content: msg.content}));
			// conversations.map((conv, index) => {
			// 	const privmsg : convMessage[] = [];
			// 	convMessages.forEach(msg => privmsg.push({authorName: msg.authorId, authorId: msg.authorName, creationTime: msg.createdAt, content: msg.content}));
			// 	chat.push({isChannel: false, targetId: conv.receiverId, targetName: userNames[index].pseudo, messages: privmsg});
			// 	// chat.push({targetId: conv.receiverId, targetName: userNames[index].pseudo});
			// });
			const rooms = await this.roomService.getPublicRooms(Number(req.user.sub));
			const roomIds = []
			rooms.forEach(room => roomIds.push(room.channelId));
			const messages = await Promise.all(roomIds.map(chan => this.messageService.getMessagesfromChannel(Number(req.user.sub), chan.channelId)));
			// const mm = messages.(msg => msg.filter(chan => chan.channelId === 2));
			console.log("MM", messages, "MM");
			rooms.forEach((room, index) => {
				chat.push({isChannel: true, channelId: room.channelId, channelName: room.channelName, userPermissionMask: room.permissionMask, messages: messages[index].filter(chan => chan.channelId === room.channelId)});
			});
			return chat;
			console.log(rooms, chat);
			// chat.forEach((chan, index) => chan[index][{messages : messages[index]}]);
			// console.log(chat);

		} catch (error) {
			console.log('coucou', error.message);
		}
	}
}

// isChannel: boolean,
// channelId?: number,
// channelName?: string,
// targetId?: number
// targetName?: string,
// userPermissionMask?: number,
// messages: convMessage[],


// interface convMessage {
//     authorName: string,
//     authorId: number,
//     creationTime: Date,
//     content: string,
// }