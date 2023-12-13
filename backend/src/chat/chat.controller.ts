/* eslint-disable prettier/prettier */
import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Request, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IsInt, IsNotEmpty, IsPositive, IsString, Length, Max, MaxLength, Min } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { ConversationsService } from 'src/conversations/conversations.service';
import { ChatAddInviteEvent } from 'src/events/chat/addInvite.event';
import { ChatAddPasswordEvent } from 'src/events/chat/addPassword.event';
import { ChatChangePasswordEvent } from 'src/events/chat/changePassword.event';
import { ChatCreatePrivateChannelEvent } from 'src/events/chat/createPrivateChannel.event';
import { ChatExitChannelEvent } from 'src/events/chat/exitChannel.event';
import { ChatInviteInChannelEvent } from 'src/events/chat/inviteInChannel.event';
import { ChatKickFromChannelEvent } from 'src/events/chat/kickFromChannel.event';
import { ChatMuteOnChannelEvent } from 'src/events/chat/muteOnChannel.event';
import { ChatRemoveInviteEvent } from 'src/events/chat/removeInvite.event';
import { ChatRemovePasswordEvent } from 'src/events/chat/removePassword.event';
import { ChatUnMuteOnChannelEvent } from 'src/events/chat/unMuteOnChannel.event';
import { MessagesService } from 'src/messages/messages.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckIntPipe } from 'src/profile/profile.pipe';
import { UsersService } from 'src/users_chat/users_chat.service';
import { AuthGuard } from '../auth/auth.guard';
import { RoomService } from '../rooms/rooms.service';
import { CheckIntPipeChat } from './chat.pipe';
import { ChatService } from './chat.service';


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

export class ManageInviteDTO {
    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
	channelId: number
}

export class InviteInChannelDTO {
	@IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
	channelId: number

	@IsString()
	@IsNotEmpty()
	@Length(3, 10)
    targetName: string;
}

export class RemovePwdDto {
    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
    channelId: number
}

export class CreatePrivateChannelDTO {
	// @IsString()
	// @IsNotEmpty()
	// // @Length(3, 10)
    channelName: string;
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

	@Post('create-private-channel')
	async handleCreateprivateChannel(
		@Body() DTO: CreatePrivateChannelDTO,
		@Request() req: ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined) {
			return;
		}
		this.eventEmitter.emit("chat.createprivatechannel", new ChatCreatePrivateChannelEvent(userId, DTO.channelName));
	}

	@Post('invite-user')
	async handleInvite(
		@Body() inviteDTO: InviteInChannelDTO,
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined) {
			return;
		}
		this.eventEmitter.emit('chat.invitechannel', new ChatInviteInChannelEvent(userId, inviteDTO.channelId, inviteDTO.targetName));

	}

	@Post('add-invite')
	async handleAddInvite(
		@Param() inviteDTO : ManageInviteDTO,
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.addinvite', new ChatAddInviteEvent(userId, inviteDTO.channelId));
	}

	@Post('rm-invite')
	async handleRemoveInvite(
		@Param() inviteDTO: ManageInviteDTO,
		@Request() req : ExpressRequest
	) {
		const userId = Number(req.user.sub);
		if (userId == undefined)
			return;
		this.eventEmitter.emit('chat.rminvite', new ChatRemoveInviteEvent(userId, inviteDTO.channelId));
	}

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
            const rooms = await this.roomService.getPublicRoomsWhereNotBanned(userId);
			const access = await Promise.all(rooms.map(room => this.roomService.getAccessMask(room.channelId)));
            const chans = [];
            const state = await Promise.all(rooms.map(room => this.roomService.getMembershipState(room.channelId, userId)));

            rooms.forEach((room, index) => chans.push({channelId: room.channelId, channelName: room.channelName, userPermissionMask: room.permissionMask, accessMask: access[index].accessMask, membershipState: state[index].membershipState}));
			
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
        @Body() { channelName, password }: JoinChannelDto,
        @Request() req : ExpressRequest
    ) {
        const userId = req.user.id;

        try {
            const channelData = await this.chatService.joinRoom(userId, channelName, password);

            if (channelData == null || channelData == undefined)
                throw Error;
            return channelData;
        } catch (e) {
            throw new ForbiddenException(e.message);
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
        @Body() { channelId, targetId }: ActionsDto,
		@Request() req : ExpressRequest
	) {
        const userId = req.user.id;
        const resp = await this.chatService.banFromChannel(userId, channelId, targetId);
	
        return resp;
    }

	@Post('unban-user')
	async handleUnBan(
        @Body() { channelId, targetId }: ActionsDto,
		@Request() req : ExpressRequest
	) {
        const userId = req.user.id;
        const resp = await this.chatService.unBanFromChannel(userId, channelId, targetId);

        return resp;
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
        @Body() { channelId, targetId }: ActionsDto,
		@Request() req: ExpressRequest
	) {
        const userId = req.user.id;
        const resp = await this.chatService.addAdmin(userId, channelId, targetId);
	
        return resp;
    }

	@Post('rm-admin')
	async handleRemoveAdmin(
        @Body() { channelId, targetId }: ActionsDto,
        @Request() req : ExpressRequest
	) {
        const userId = req.user.id;
        const resp = await this.chatService.removeAdmin(userId, channelId, targetId);

        return resp;
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
    @HttpCode(HttpStatus.NO_CONTENT)
    async handleDeleteRoom(
        @Body() deleteDto: DeleteChannelDto,
        @Request() req: ExpressRequest
    ) {
        const userId = req.user.id;

        this.chatService.deleteChannel(userId, deleteDto.channelId);
    }
}
