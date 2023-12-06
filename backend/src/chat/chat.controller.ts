/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users_chat/DBusers.service';
import { RoomService } from '../rooms/DBrooms.service';
import { Request as ExpressRequest } from 'express';
import { ChatService } from './DBchat.service';
import { AuthGuard } from '../auth/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Prisma } from '@prisma/client';
import { ChatMuteOnChannelEvent } from 'src/events/chat/muteOnChannel.event';
import { ChatUnMuteOnChannelEvent } from 'src/events/chat/unMuteOnChannel.event';
import { ChatBanFromChannelEvent } from 'src/events/chat/banFromChannel.event';
import { ChatUnBanFromChannelEvent } from 'src/events/chat/unBanFromChannel.event';
import { ChatKickFromChannelEvent } from 'src/events/chat/kickFromChannel.event';
import { ChatAddAdminToChannelEvent } from 'src/events/chat/addAdminToChannel.event';
import { ChatRemoveAdminFromChannelEvent } from 'src/events/chat/removeAdminFromChannel.event';
import { ChatExitChannelEvent } from 'src/events/chat/exitChannel.event';
import { ChatJoinChannelEvent } from 'src/events/chat/joinChannel.event';
import { ChatAddInviteEvent } from 'src/events/chat/addInvite.event';
import { ChatAddPasswordEvent } from 'src/events/chat/addPassword.event';
import { ChatInviteInChannelEvent } from 'src/events/chat/inviteInChannel.event';
import { ChatRemoveInviteEvent } from 'src/events/chat/removeInvite.event';
import { ChatRemovePasswordEvent } from 'src/events/chat/removePassword.event';
import { ChatChangePasswordEvent } from 'src/events/chat/changePassword.event';

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
		private readonly messageService : MessagesService,
		private readonly eventEmitter: EventEmitter2
		) {}

    // **
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

	/**
	 * return : toutes les informations sur le channel, type messages, users et tout ça
	 */
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
			this.eventEmitter.emit('chat.joinchannel', new ChatJoinChannelEvent(6, "channel", 9, "coucou"));
			// this.eventEmitter.emit('chat.joinchannel', new ChatJoinChannelEvent(Number(req.user.sub), "channel", undefined, ""));
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('exit-channel')
	async exitChannel(
		@Request() req : ExpressRequest
	) {
		try {
			console.log("top");
			this.eventEmitter.emit('chat.exitchannel', new ChatExitChannelEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.exitchannel', new ChatExitChannelEvent(Number(req.user.sub), "chan1", 2));
		} catch(err) {
			console.log(err.message);
		}
	}

	/**
	 * return id conversation et nom de la personne avec qui je discute
	//  */
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

	@Post('invite-user')
	async handleInvite(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.invitechannel', new ChatInviteInChannelEvent(2, 9, "channel", 1));
			// this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(Number(req.user.sub), "coucou", 2, 4));
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('mute-user')
	async handleMute(
		@Request() req : ExpressRequest
	) {
		try {
			console.log("coucou");
			this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(Number(req.user.sub), "coucou", 2, 4));
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('unmute-user')
	async handleUnMute(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.unmute', new ChatUnMuteOnChannelEvent(2, "channel", 9, 1))
			// this.eventEmitter.emit('chat.unmute', new ChatUnMuteOnChannelEvent(Number(req.user.sub), "coucou", 2, 4))
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('ban-user')
	async handleBan(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.ban', new ChatBanFromChannelEvent(2, "channel", 9, 1));
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('unban-user')
	async handleUnBan(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.unban', new ChatUnBanFromChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.unban', new ChatUnBanFromChannelEvent(Number(req.user.sub), "coucou", 2, 4));
		} catch (err) {
			console.log(err.message);
		}
	}

	@Post('kick-user')
	async handleKick(
		@Request() req: ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.kick', new ChatKickFromChannelEvent(2, "channel", 9, 4));
			// this.eventEmitter.emit('chat.kick', new ChatKickFromChannelEvent(Number(req.user.sub), "coucou", 2, 2));
		} catch(err) {
			console.log(err.message);
		}
	}

	@Post('add-admin')
	async handleAddAdmin(
		@Request() req: ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.addadmin', new ChatAddAdminToChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.addadmin', new ChatAddAdminToChannelEvent(Number(req.user.sub), "chan", 2, 2));
		} catch(error) {
			console.log(error.message);
		}
	}

	@Post('rm-admin')
	async handleRemoveAdmin(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.rmadmin', new ChatRemoveAdminFromChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.rmadmin', new ChatRemoveAdminFromChannelEvent(Number(req.user.sub), "chan", 2, 2));
		} catch(error) {
			console.log(error.message);
		}
	}

	@Post('add-invite')
	async handleAddInvite(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(Number(req.user.sub), "super", 5));
		} catch(error) {
			console.log(error.message);
		}
	}

	@Post('rm-invite')
	async handleRemoveInvite(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.rminvite', new ChatRemoveInviteEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(Number(req.user.sub), "super", 5));
		} catch(error) {
			console.log(error.message);
		}
	}

	@Post('change-pwd')
	async handleChangePassword(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.changepwd', new ChatChangePasswordEvent(2, "channel", 9, "coucou"));
			// this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(Number(req.user.sub), "super", 5));
		} catch(error) {
			console.log(error.message);
		}
	}

	@Post('add-pwd')
	async handleAddPwd(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(2, "channel", 9, "pwd"));
			// this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(Number(req.user.sub), "super", 5, "pwd"));
		} catch(error) {
			console.log(error.message);
		}
	}

	@Post('rm-pwd')
	async handleRemovePwd(
		@Request() req : ExpressRequest
	) {
		try {
			this.eventEmitter.emit('chat.rmpwd', new ChatRemovePasswordEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(2, "channel", 9, "pwd"));
			// this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(Number(req.user.sub), "super", 5, "pwd"));
		} catch(error) {
			console.log(error.message);
		}
	}

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
}