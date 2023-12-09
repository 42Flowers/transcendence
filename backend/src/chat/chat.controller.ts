/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users_chat/DBusers.service';
import { RoomService } from '../rooms/rooms.service';
import { Request as ExpressRequest } from 'express';
import { ChatService } from './chat.service';
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
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckIntPipe } from 'src/profile/profile.pipe';

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


interface channelElem {
    messages: Message[],
    users: users[],
}


interface Message {
	authorName: string,
	authorId: number,
	id: number,
	content: string,
	createdAt: Date,
}

interface users {
    userId: number,
	userName: string,
    membershipState: number,
	avatar: string,
}

import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ChatDeleteChannelEvent } from 'src/events/chat/deleteChannel.event';

export class JoinChannelDto {
    @IsString()
    channelName: string;

    @IsString()
    password: string;
}

export class QuitDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    channelId: number;
}

export class TargetDto {
    @IsString()
    //@IsNotEmpty() ??
    targetName: string;
}

/**
 * !Faire les vérifications si la personne est bien dans le channel et si elle est BAN
 */

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {


    constructor(
        private readonly roomService: RoomService,
        private readonly chatService: ChatService,
        private readonly userService: UsersService,
        private readonly conversationService: ConversationsService,
        private readonly messageService : MessagesService,
        private readonly eventEmitter: EventEmitter2,
        private readonly prismaService: PrismaService
        ) {}


	@Get('get-blocked-users')
	async getBlockedUsers(
		@Request() req: ExpressRequest
	) {
		try {
			const userId = Number(req.user.sub);
			const blockedUsers = await this.prismaService.blocked.findMany({
				where: {
					userId: userId,
				},
				select: {
					blockedId: true,
				}
			});
			return blockedUsers;
		} catch(err) {
                console.log(err.message);
		}
	}

    @Get('get-channels')
    async getChannels(
        @Request() req: ExpressRequest
    ) {
        try {
			const userId = Number(req.user.sub);
            const rooms = await this.roomService.getPublicRooms(userId);
            const chans = [];
            rooms.forEach(room => chans.push({channelId: room.channelId, channelName: room.channelName, userPermissionMask: room.permissionMask}));
            return chans;
        } catch (err) {
                console.log(err.message);
        }
    }


    @Get('get-channelmessages/:channelId')
    async getChannelContext(
        @Request() req: ExpressRequest,
		@Param('channelId', CheckIntPipe) channelId: number,
    ) {
        try {
            const userId = Number(req.user.sub);
            const member = await this.roomService.isUserinRoom(userId, channelId);
            if (member != null && member.membershipState !== 4) {
                const messagesfromchannel = await this.messageService.getMessagesfromChannel(userId, channelId);
                const messages : Message[] = [];
                const userNames = await Promise.all(messagesfromchannel.map(conv => this.userService.getUserName(conv.authorId)));
                messagesfromchannel.map((chan, index) => {
					messages.push({authorName: userNames[index].pseudo, authorId: chan.authorId, content: chan.content, createdAt: chan.createdAt, id:chan.id});
				});
                return messages;
            }
            return null;
        } catch (err) {
            console.log(err.message);
        }
    }


    @Get('get-channelmembers/:channelId')
    async getChannelMembers(
        @Request() req: ExpressRequest,
		@Param('channelId', CheckIntPipe) channelId: number,
    ) {
        try {
            const userId = Number(req.user.sub);
            const member = await this.roomService.isUserinRoom(userId, channelId);
            if (member != null && member.membershipState !== 4) {
                const users : users[] = [];
                const allusers = await this.roomService.getUsersfromRoom(channelId);
                const membershipStates = await Promise.all(allusers.map(user => this.userService.getMembershipState(user.userId, channelId)));
                allusers.map((user, index) => {
					users.push({userId: user.userId, userName: user.user.pseudo, membershipState: membershipStates[index], avatar: user.user.avatar})
				});
				return users;
            }
            return null;
        } catch (error) {
            console.log(error.message);
        }
    }


    @Post('join-channel')
    async joinChannel(
        @Body() joinChannelDto: JoinChannelDto,
        @Request() req : ExpressRequest
    ) {
        try {
            this.eventEmitter.emit('chat.joinchannel', new ChatJoinChannelEvent(Number(req.user.sub), joinChannelDto.channelName, joinChannelDto.password));
        } catch (err) {
			console.log(err.message);
        }
    }

    @Post('exit-channel')
    async exitChannel(
        @Body() quitDto: QuitDto,
        @Request() req : ExpressRequest
    ) {
          console.log("Hello2");
          this.eventEmitter.emit('chat.exitchannel', new ChatExitChannelEvent(Number(req.user.sub), quitDto.channelId)); // TODO: quitDto.channelId
          // this.eventEmitter.emit('chat.exitchannel', new ChatExitChannelEvent(Number(req.user.sub), "chan1", 2));
    }


    /**
     * return id conversation et nom de la personne avec qui je discute
     */
    @Get('get-conversations')
    async getPrivateConversations(
        @Request() req: ExpressRequest
    ) {
        try {
			const userId = Number(req.user.sub);
            // const conversations = await this.conversationService.getAllUserConversations(Number(req.user.sub));
            const conversations = await this.conversationService.getAllUserConversations(userId);
            const convs = []
            const userNames = await Promise.all(conversations.map(conv => this.userService.getUserName(conv.receiverId)));
            conversations.map((conv, index) => {
                convs.push({targetId: conv.receiverId, targetName: userNames[index].pseudo});
            });
            return convs;
        } catch (err) {
            console.log(err.message);
        }
    }

    @Post('create-conversation')
    async createConversation(
        // @Body() targetDto: TargetDto,
        @Request() req: ExpressRequest
    ) {
        try {
            const conversation = await this.chatService.createConversation(2, "User3");
            // const conversation = await this.chatService.createConversation(Number(req.user.sub), targetDto.targetName);
            return conversation;
        } catch(error) {
            console.log(error.message);
        }
    }


    @Get('get-privatemessages/:targetId')
    async privateConversation(
        @Request() req: ExpressRequest,
		@Param('targetId', CheckIntPipe) targetId: number,
    ) {
        try {
			const userId = Number(req.user.sub);
            const conversations = await this.chatService.getPrivateConversation(userId, targetId);
            const messages = [];
            if (conversations != null) {
                const authorNames = await Promise.all(conversations.map(conv => this.userService.getUserName(conv.authorId)));
                conversations.map((msg, index) => messages.push({authorId: msg.authorId, authorName: authorNames[index].pseudo, content: msg.content, creationTime: msg.createdAt, id: msg.id}));
                return messages;
            }
            return "nope";
        } catch (err) {
            console.log(err.message);
        }
    }


	@Post('invite-user')
	async handleInvite(
		@Request() req : ExpressRequest
	) {
		this.eventEmitter.emit('chat.invitechannel', new ChatInviteInChannelEvent(2, "channel", 9, 1));
		// this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(Number(req.user.sub), "coucou", 2, 4));

	}

	@Post('mute-user')
	async handleMute(
		@Request() req : ExpressRequest
	) {
		this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(2, "channel", 17, 7));
		// this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(Number(req.user.sub), "coucou", 2, 4));

	}

	@Post('unmute-user')
	async handleUnMute(
		@Request() req : ExpressRequest
	) {
		this.eventEmitter.emit('chat.unmute', new ChatUnMuteOnChannelEvent(2, "channel", 9, 1))
		// this.eventEmitter.emit('chat.unmute', new ChatUnMuteOnChannelEvent(Number(req.user.sub), "coucou", 2, 4))

	}

	@Post('ban-user')
	async handleBan(
		@Request() req : ExpressRequest
	) {
		this.eventEmitter.emit('chat.ban', new ChatBanFromChannelEvent(2, "channel", 9, 1));
	}

	@Post('unban-user')
	async handleUnBan(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.unban', new ChatUnBanFromChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.unban', new ChatUnBanFromChannelEvent(Number(req.user.sub), "coucou", 2, 4));
	}

	@Post('kick-user')
	async handleKick(
		@Request() req: ExpressRequest
	) {
			this.eventEmitter.emit('chat.kick', new ChatKickFromChannelEvent(2, "channel", 9, 4));
			// this.eventEmitter.emit('chat.kick', new ChatKickFromChannelEvent(Number(req.user.sub), "coucou", 2, 2));
	}

	@Post('add-admin')
	async handleAddAdmin(
		@Request() req: ExpressRequest
	) {
			this.eventEmitter.emit('chat.addadmin', new ChatAddAdminToChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.addadmin', new ChatAddAdminToChannelEvent(Number(req.user.sub), "chan", 2, 2));
	}

	@Post('rm-admin')
	async handleRemoveAdmin(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.rmadmin', new ChatRemoveAdminFromChannelEvent(2, "channel", 9, 1));
			// this.eventEmitter.emit('chat.rmadmin', new ChatRemoveAdminFromChannelEvent(Number(req.user.sub), "chan", 2, 2));
	}

	@Post('add-invite')
	async handleAddInvite(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(Number(req.user.sub), "super", 5));
	}

	@Post('rm-invite')
	async handleRemoveInvite(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.rminvite', new ChatRemoveInviteEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(Number(req.user.sub), "super", 5));
	}

	@Post('change-pwd')
	async handleChangePassword(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.changepwd', new ChatChangePasswordEvent(2, "channel", 9, "coucou"));
			// this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(Number(req.user.sub), "super", 5));
	}

	@Post('add-pwd')
	async handleAddPwd(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(2, "channel", 9, "pwd"));
			// this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(Number(req.user.sub), "super", 5, "pwd"));
	}

	@Post('rm-pwd')
	async handleRemovePwd(
		@Request() req : ExpressRequest
	) {
			this.eventEmitter.emit('chat.rmpwd', new ChatRemovePasswordEvent(2, "channel", 9));
			// this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(2, "channel", 9, "pwd"));
			// this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(Number(req.user.sub), "super", 5, "pwd"));
	}

	@Post('delete-channel')
	async handleDeleteRoom(
		@Request() req: ExpressRequest
	) {
		console.log("super, j'adore");
		this.eventEmitter.emit('chat.delete', new ChatDeleteChannelEvent(2, "channel", 4));
	}

	@Get('get-friends')
	async getFriends(
		@Request() req: ExpressRequest
	) {
		try {
			const friends = await this.userService.getFriends(Number(req.user.sub));
			return friends;
		} catch (err) {
			console.log(err.message);
		}
	}
}
