/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users_chat/users_chat.service';
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
import { ChatAddPasswordEvent } from 'src/events/chat/addPassword.event';
import { ChatRemovePasswordEvent } from 'src/events/chat/removePassword.event';
import { ChatChangePasswordEvent } from 'src/events/chat/changePassword.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckIntPipe } from 'src/profile/profile.pipe';


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
	permissionMask: number
}

import { IsString, IsNumber, IsNotEmpty, Min, Max, MaxLength } from 'class-validator';
import { ChatDeleteChannelEvent } from 'src/events/chat/deleteChannel.event';

export class JoinChannelDto {
    @IsString()
	@MaxLength(10)
    channelName: string;

    @IsString()
	@MaxLength(20)
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
			if (userId == undefined)
				return;
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
			if (userId == undefined)
				return;
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
			if (userId == undefined)
				return;
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
			if (userId == undefined)
				return;
            const member = await this.roomService.isUserinRoom(userId, channelId);
            if (member != null && member.membershipState !== 4) {
                const users : users[] = [];
                const allusers = await this.roomService.getUsersfromRoom(channelId);
                const membershipStates = await Promise.all(allusers.map(user => this.userService.getMembershipState(user.userId, channelId)));
				const permissionMasks = await Promise.all(allusers.map(user => this.userService.getPermissionMask(user.userId, channelId)));
                allusers.map((user, index) => {
					users.push({userId: user.userId, userName: user.user.pseudo, membershipState: membershipStates[index], permissionMask: permissionMasks[index], avatar: user.user.avatar})
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
			const userId = Number(req.user.sub);
			if (userId == undefined)
				return;
            this.eventEmitter.emit('chat.joinchannel', new ChatJoinChannelEvent(userId, joinChannelDto.channelName, joinChannelDto.password));
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
		  const userId = Number(req.user.sub);
		  if (userId == undefined)
			  return;
          this.eventEmitter.emit('chat.exitchannel', new ChatExitChannelEvent(userId, quitDto.channelId)); // TODO: quitDto.channelId
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
			if (userId == undefined)
				return;
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
        @Body() targetDto: TargetDto,
        @Request() req: ExpressRequest
    ) {
        try {
			const userId = Number(req.user.sub);
			if (userId == undefined)
				return;
            const conversation = await this.chatService.createConversation(userId, targetDto.targetName);
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
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.kick', new ChatKickFromChannelEvent(userId, "channel", 9, 4));
	}

	@Post('add-admin')
	async handleAddAdmin(
		@Request() req: ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.addadmin', new ChatAddAdminToChannelEvent(userId, "channel", 9, 1));
	}

	@Post('rm-admin')
	async handleRemoveAdmin(
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.rmadmin', new ChatRemoveAdminFromChannelEvent(userId, "channel", 9, 1));
	}

	@Post('change-pwd')
	async handleChangePassword(
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.changepwd', new ChatChangePasswordEvent(userId, "channel", 9, "coucou"));
	}

	@Post('add-pwd')
	async handleAddPwd(
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(userId, "channel", 9, "pwd"));
	}

	@Post('rm-pwd')
	async handleRemovePwd(
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.rmpwd', new ChatRemovePasswordEvent(userId, "channel", 9));
	}

	@Post('delete-channel') //TODO les DTO
	async handleDeleteRoom(
		@Request() req: ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.delete', new ChatDeleteChannelEvent(userId, "channel", 4));
	}

	@Get('get-friends')
	async getFriends(
		@Request() req: ExpressRequest
	) {
		try {
			const userId = Number(req.user.sub);
			if (userId == undefined)
				return;
			const friends = await this.userService.getFriends(userId);
			return friends;
		} catch (err) {
			console.log(err.message);
		}
	}
}
