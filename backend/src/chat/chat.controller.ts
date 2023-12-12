/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Request, Param, NotFoundException } from '@nestjs/common';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users_chat/users_chat.service';
import { RoomService } from '../rooms/rooms.service';
import { Request as ExpressRequest } from 'express';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter'
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
import { ChatDeleteChannelEvent } from 'src/events/chat/deleteChannel.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckIntPipe } from 'src/profile/profile.pipe';
import { IsString, IsInt, IsNotEmpty, Min, Max, MaxLength, MinLength, Length, IsPositive, IsAscii } from 'class-validator';
import { CheckIntPipeChat } from './chat.pipe'


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

export class JoinChannelDto {
    @IsString()
	@IsNotEmpty()
	@Length(3, 10)
    channelName: string;

    @IsString()
	@MaxLength(20)
    password: string;
}

export class QuitDto {
    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
    channelId: number;
}

export class TargetDto {
    @IsString()
	@IsNotEmpty()
	@Length(3, 10)
    targetName: string;
}

export class DeleteChannelDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
	@IsPositive()
	@Max(1000000)
    channelId: number
}

export class ActionsDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
	@Max(1000000)
	@IsPositive()
    channelId: number

    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
    targetId: number
}

export class ManagePwdDto {
    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
    channelId: number

    @IsNotEmpty()
    @IsString()
	@Length(3, 20)
    pwd: string
}

export class RemovePwdDto {
    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
    channelId: number
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
		} catch {
            ;
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
			const access = await Promise.all(rooms.map(room => this.roomService.getAccessMask(room.channelId)));
            const chans = [];
            rooms.forEach((room, index) => chans.push({channelId: room.channelId, channelName: room.channelName, userPermissionMask: room.permissionMask, accessMask: access[index].accessMask}));
			return chans;
        } catch {
            ;
        }
    }


    @Get('get-channelmessages/:channelId')
    async getChannelContext(
        @Request() req: ExpressRequest,
		@Param('channelId', CheckIntPipeChat) channelId: number,
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
        } catch {
            ;
        }
    }


    @Get('get-channelmembers/:channelId')
    async getChannelMembers(
        @Request() req: ExpressRequest,
        @Param('channelId', CheckIntPipeChat) channelId: number,
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
        } catch {
            ;
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
        } catch {
            ;
        }
    }

    @Post('exit-channel')
    async exitChannel(
        @Body() quitDto: QuitDto,
        @Request() req : ExpressRequest
    ) {
		  const userId = Number(req.user.sub);
		  if (userId == undefined)
			  return;
          this.eventEmitter.emit('chat.exitchannel', new ChatExitChannelEvent(userId, quitDto.channelId));
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
                convs.push({targetId: conv.receiverId, targetName: userNames[index].pseudo, avatar: userNames[index].avatar});
            });
            return convs;
        } catch {
            ;
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
        } catch {
            ;
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
                conversations.map((msg, index) => messages.push({authorId: msg.authorId, authorName: authorNames[index].pseudo, content: msg.content, createdAt: msg.createdAt, id: msg.id}));
                return messages;
            }
            throw new NotFoundException();
        } catch {
            ;
        }
    }

	@Post('mute-user')
	async handleMute(
        @Body() actionsDto: ActionsDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.mute', new ChatMuteOnChannelEvent(userId, actionsDto.channelId, actionsDto.targetId));
	}

	@Post('unmute-user')
	async handleUnMute(
        @Body() actionsDto: ActionsDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.unmute', new ChatUnMuteOnChannelEvent(userId, actionsDto.channelId, actionsDto.targetId))
	}

	@Post('ban-user')
	async handleBan(
        @Body() actionsDto: ActionsDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.ban', new ChatBanFromChannelEvent(userId, actionsDto.channelId, actionsDto.targetId));
	}

	@Post('unban-user')
	async handleUnBan(
        @Body() actionsDto: ActionsDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.unban', new ChatUnBanFromChannelEvent(userId, actionsDto.channelId, actionsDto.targetId));
	}

	@Post('kick-user')
	async handleKick(
        @Body() { channelId, targetId }: ActionsDto,
		@Request() req: ExpressRequest
	) {
        const userId = req.user.id;
        this.eventEmitter.emit('chat.kick', new ChatKickFromChannelEvent(userId, channelId, targetId));
	}

	@Post('add-admin')
	async handleAddAdmin(
        @Body() actionsDto: ActionsDto,
		@Request() req: ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
        this.eventEmitter.emit('chat.addadmin', new ChatAddAdminToChannelEvent(userId, actionsDto.channelId, actionsDto.targetId));
	}

	@Post('rm-admin')
	async handleRemoveAdmin(
        @Body() actionsDto: ActionsDto,
		    @Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.rmadmin', new ChatRemoveAdminFromChannelEvent(userId, actionsDto.channelId, actionsDto.targetId));
	}

	@Post('change-pwd')
	async handleChangePassword(
        @Body() managePwdDto: ManagePwdDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.changepwd', new ChatChangePasswordEvent(userId, managePwdDto.channelId, managePwdDto.pwd));
	}

	@Post('add-pwd')
	async handleAddPwd(
        @Body() managePwdDto: ManagePwdDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.addpwd', new ChatAddPasswordEvent(userId, managePwdDto.channelId, managePwdDto.pwd));
	}

	@Post('rm-pwd')
	async handleRemovePwd(
        @Body() removePwdDto: RemovePwdDto,
		@Request() req : ExpressRequest
	) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
		this.eventEmitter.emit('chat.rmpwd', new ChatRemovePasswordEvent(userId, removePwdDto.channelId));
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
		} catch {
            ;
		}
	}

    @Post('delete-channel')
    async handleDeleteRoom(
        @Body() deleteDto: DeleteChannelDto,
        @Request() req: ExpressRequest
    ) {
        const userId = Number(req.user.sub);
        if (userId == undefined)
            return;
        this.eventEmitter.emit('chat.delete', new ChatDeleteChannelEvent(userId, deleteDto.channelId));
    }
}
