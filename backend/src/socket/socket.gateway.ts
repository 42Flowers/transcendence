import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserPayload } from "src/auth/user.payload";
import { ChatChannelMessageEvent } from "src/events/chat/channelMessage.event";
import { ChatPrivateMessageEvent } from "src/events/chat/privateMessage.event";
import { ChatSendMessageEvent } from "src/events/chat/sendMessage.event";
import { ChatSendRoomToClientEvent } from "src/events/chat/sendRoomToClient.event";
import { ChatSendToChannelEvent } from "src/events/chat/sendToChannel.event";
import { ChatSendToClientEvent } from "src/events/chat/sendToClient.event";
import { ChatSocketJoinChannelsEvent } from "src/events/chat/socketJoinChannels.event";
import { ChatSocketLeaveChannelsEvent } from "src/events/chat/socketLeaveChannels.event";
import { ChatUserBlockEvent } from "src/events/chat/userBlock.event";
import { ChatUserUnBlockEvent } from "src/events/chat/userUnBlock.event";
import { GameCancelSearchEvent } from "src/events/game/cancelSearch.event";
import { GameInviteToNormal } from "src/events/game/inviteToNormalGame.event";
import { GameInviteToSpecial } from "src/events/game/inviteToSpecialGame.event";
import { GameJoinInvite } from "src/events/game/joinInvite.event";
import { GameJoinRandomEvent } from "src/events/game/joinRandom.event";
import { GameKeyDownEvent } from "src/events/game/keyDown.event";
import { GameKeyUpEvent } from "src/events/game/keyUp.event";
import { Game, GameMode } from "src/game/game";
import { PrismaService } from "src/prisma/prisma.service";
import { v4 as uuidv4 } from 'uuid';
import { SocketService } from "./socket.service";
import { IsAscii, IsNotEmpty, IsInt, IsString, Max, MaxLength, Min, MinLength, ValidationArguments, ValidationOptions, registerDecorator, IsPositive } from 'class-validator';
import { ChatSendMessageToConversationdEvent } from "src/events/chat/sendMessageToConversation.event";
import { UserDeclineGameInvitation } from "src/events/user.decline.invitation.event";

declare module 'socket.io' {
	interface Socket {
		/**
		 * Authenticated user for this socket.
		 * Should always be defined.
		 */
		user?: UserPayload;

		/**
		 * Current game for this socket.
		 */
		game?: Game;
	}
}

export function IsNoSpecialCharactersChat(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
		name: 'isNoSpecialCharactersChat',
		target: object.constructor,
		propertyName: propertyName,
		options: validationOptions,
		validator: {
			validate(value: any, args: ValidationArguments) {
				return typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value);
			},
			defaultMessage(args: ValidationArguments) {
				return 'Only a to z, A to Z, 0 to 9 are allowed';
			}
		}
		});
	};
}

/* ==== CHAT DTO ==== */
// export class PrivateMessageDTO {
// 	@IsInt()
// 	@IsNotEmpty()
// 	@Max(1000000)
// 	@Min(1)
// 	@IsPositive()
// 	targetId: number

// 	@IsString()
// 	@IsNotEmpty()
// 	@MaxLength(100)
// 	@MinLength(1)
// 	@IsAscii()
// 	message: string
// };

// export class ChannelMessageDTO {
// 	@IsInt()
// 	@IsNotEmpty()
// 	@Max(1000000)
// 	@Min(1)
// 	@IsPositive()
// 	channelId: number

// 	@IsString()
// 	@IsNotEmpty()
// 	@MaxLength(10)
// 	@MinLength(3)
// 	// @IsNoSpecialCharactersChat()
// 	channelName: string

// 	@IsString()
// 	@IsNotEmpty()
// 	@MaxLength(100)
// 	@MinLength(1)
// 	@IsAscii()
// 	message: string
// };

@Injectable()
@WebSocketGateway({
	cors: {
		origin: ["http://localhost:5173"],
	},
})
export class SocketGateway implements
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2,
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService
		) {}

	afterInit() {
		this.server.use((socket, next) => {
			this.authenticateUser(socket).then(
				() => next(),
				err => next(err));
		})
	}

	validateId(id: number) {
		if (id == null || id == undefined || id < 1 || id > 1000000 || !Number.isInteger(id))
			return false;

		return true;
	}

	validateMessage(msg: string) {
		function isASCII(str: string): boolean {
			return /^[\x00-\x7F]*$/.test(str);
		}
		function hasNonWhitespace(str: string): boolean {
			return str.trim() !== "";
		}

		if (msg == null || msg == undefined || msg.length > 100 || msg.length < 1 || !isASCII(msg) || !hasNonWhitespace(msg))
			return false;

		return true;
	}

	private async authenticateUser(socket: Socket): Promise<void> {
		const { auth } = socket.handshake;

		const payload = await this.jwtService.verifyAsync<UserPayload>(auth['token']);
		const userPayload = await this.prismaService.user.findUniqueOrThrow({
			where: {
				id: Number(payload.sub),
			},
		});
		socket.user = { ...userPayload, ...payload };
	}

	async handleConnection(client: Socket) {
		if (client == null || client == undefined)
			return;
		client.join('server');
		this.socketService.addSocket(client);
		this.eventEmitter.emit('chat.socketjoinchannels', new ChatSocketJoinChannelsEvent(Number(client.user.sub), client))
	}

	async handleDisconnect(client: Socket) {
		if (client == null || client == undefined)
			return;
		client.leave('server');
		this.eventEmitter.emit('chat.socketleavechannels', new ChatSocketLeaveChannelsEvent(Number(client.user.sub), client));
		this.socketService.removeSocket(client);
	}

	@OnEvent('chat.sendtoclient')
	sendToClient({ userId, type, data }: ChatSendToClientEvent) {
		this.socketService.emitToUserSockets(userId, 'info', {
			type,
			msg: data,
		});
	}

	@OnEvent('chat.sendroomtoclient')
	sendRoomToClient({userId, type, channel}: ChatSendRoomToClientEvent
	) {
		this.socketService.emitToUserSockets(userId, 'channel', {type: type, channel: channel});
	}

	@OnEvent('chat.sendmessage')
	sendMessage(event: ChatSendMessageEvent) 
	{
		let dest;
		if (event.type == "channel") {
			dest = uuidv4();
			event.channelUsers.forEach(user => {
				this.socketService.joinChannel(user.userId, dest);
			})
		}
		else {
			dest = event.destination;
		}
		this.server.to(dest).emit('message', 
			{
				type: event.type, 
				authorId: event.authorId, 
				authorName: event.authorName, 
				createdAt: event.createdAt, 
				id: event.id, 
				message: event.message, 
				msgId: event.msgId,
			});
		this.socketService.emitToUserSockets(event.authorId, 'message', 
			{
				type: event.type, 
				authorId: event.authorId, 
				authorName: event.authorName, 
				createdAt: event.createdAt, 
				id: event.id, 
				message: event.message, 
				msgId: event.msgId,
			})
		if (event.type == "channel") {
			event.channelUsers.forEach(user => {
				this.socketService.leaveChannel(user.userId, dest);
			})
		}
	}

	@OnEvent('chat.sendtoconversation') 
	sendToConversation (event: ChatSendMessageToConversationdEvent) {
		const user1 = event.user1;
		const user2 = event.user2;
		this.socketService.emitToUserSockets(user2, 'message', {
			type: event.type,
			id: event.id, 
			authorId: event.authorId, 
			authorName: event.authorName, 
			message: event.message, 
			createdAt : event.createdAt,
			msgId: event.msgId,
		});
	}

	@OnEvent('chat.sendtochannel')
	sendToChannel(event: ChatSendToChannelEvent) {
		this.server.to(event.channelName).emit('info', {type: event.type, msg: event.message});
	}

	// CHAT EVENTS

	@SubscribeMessage('blockuser')
	handleBlockUser(
		@MessageBody() data: { targetId: number },
		@ConnectedSocket() client: Socket 
	) {
		try {
			const userId = Number(client.user.sub);
			if (client == null || client == undefined || !this.validateId(data.targetId))
				return;
			this.eventEmitter.emit('chat.blockuser', new ChatUserBlockEvent(userId, data.targetId));
		} catch {
			;
		}
	}

	@SubscribeMessage('unblockuser')
	handleUnBlockUser(
		@MessageBody() data: { targetId: number },
		@ConnectedSocket() client: Socket
	) {
		try {
			const userId = Number(client.user.sub);
			if (client == null || client == undefined || !this.validateId(data.targetId))
				return;
			this.eventEmitter.emit('chat.unblockuser', new ChatUserUnBlockEvent(userId, data.targetId));
		} catch {
			;
		}
	}

	@SubscribeMessage('privatemessage')
	handlePrivateMessage(
		@MessageBody() data : { targetId: number, message: string },
		@ConnectedSocket() client : Socket 
	) {
		try {
			const userId = Number(client.user.sub);
			if (client == null || client == undefined || !this.validateId(data.targetId) || !this.validateMessage(data.message))
				return;
			this.eventEmitter.emit('chat.privatemessage', new ChatPrivateMessageEvent(userId, data.targetId, data.message));
		} catch {
			;
		}
	}

	@SubscribeMessage('channelmessage')
	handleChannelMessage(
		@MessageBody() data : { channelId: number, message: string },
		@ConnectedSocket() client : Socket 
	) {
		try {
			if (client == null || client == undefined || !this.validateId(data.channelId) || !this.validateMessage(data.message))
				return;
			const userId = Number(client.user.sub);
			this.eventEmitter.emit('chat.channelmessage', new ChatChannelMessageEvent(userId, data.channelId, data.message));
		} catch {
			;
		}
	}

	@SubscribeMessage('handshake')
	// @UseGuards(AuthGuard)
	chatHandshake(
		@ConnectedSocket() client: Socket
	) {
		return {}
	}

	// GAME EVENTS

	@SubscribeMessage("joinRandomNormal")
	onJoinRandomNormal(
		@ConnectedSocket() socket: Socket)
	{
		try {
			if (socket == null || socket == undefined)
				return;
			this.eventEmitter.emit('game.joinRandom', new GameJoinRandomEvent(socket, GameMode.Normal));
		} catch (e) {
			;
		}
	}
	
	@SubscribeMessage("joinRandomSpecial")
	onRandomSpecial(
		@ConnectedSocket() socket: Socket)
	{
		try {
			if (socket == null || socket == undefined)
				return;
			this.eventEmitter.emit('game.joinRandom', new GameJoinRandomEvent(socket, GameMode.Special));
		} catch (e) {
			;
		}
	}

	@SubscribeMessage('cancelGameSearch')
	onCancelSearch(
		@ConnectedSocket() socket: Socket)
	{
		try {
			if (socket == null || socket == undefined)
				return;
			this.eventEmitter.emit('game.cancelSearch', new GameCancelSearchEvent(socket));
		} catch {
			;
		}
	}

	@SubscribeMessage("keyUp")
	onKeyUp(
		@MessageBody() key: string,
		@ConnectedSocket() socket: Socket,
	) {
		try {
			if (socket == null || socket == undefined || key == null || key == undefined || (key !== " " && key !== "ArrowUp" && key !== "ArrowDown"))
				return;
			this.eventEmitter.emit('game.keyUp', new GameKeyUpEvent(socket, key));
		} catch {
			;
		}
	}

	@SubscribeMessage("keyDown")
	onKeyDown(
		@MessageBody() key: string,
		@ConnectedSocket() socket: Socket,
	) {
		try {
			if (socket == null || socket == undefined || key == null || key == undefined || (key !== " " && key !== "ArrowUp" && key !== "ArrowDown"))
				return;
			this.eventEmitter.emit('game.keyDown', new GameKeyDownEvent(socket, key));
		} catch {
			;
		}
	}

	@SubscribeMessage("inviteNormal")
	onInviteNormal(
		@MessageBody() data: number,
		@ConnectedSocket() socket: Socket,
	)
	{
		try {
			const userId = Number(socket.user.sub);
			if (socket == null || socket == undefined || !this.validateId(data) || userId == data) {
				return;
			}
			this.eventEmitter.emit('game.inviteToNormal', new GameInviteToNormal(socket, data));
		} catch {
			;
		}
	}
	
	@SubscribeMessage("inviteSpecial")
	onInviteSpecial(
		@MessageBody() data: number,
		@ConnectedSocket() socket: Socket,
	)
	{
		try {
			const userId = Number(socket.user.sub);
			if (socket == null || socket == undefined || !this.validateId(data) || userId == data)
				return;
			this.eventEmitter.emit('game.inviteToSpecial', new GameInviteToSpecial(socket, data));
		} catch {
			;
		}
	}

	@SubscribeMessage("joinInviteGame")
	onJoinInviteGame(
		@ConnectedSocket() socket: Socket
	) {
		try {
			if (socket == null || socket == undefined)
				return;
			this.eventEmitter.emit('game.joinInvite', new GameJoinInvite(socket));
		} catch {
			;
		}
	}

	@SubscribeMessage('declineGameInvitation')
	onUserDeclineInvitation(
		@ConnectedSocket() socket: Socket
	) {
		try {
			if (socket == null || socket == undefined)
				return;
			this.eventEmitter.emit('user.decline.invitation', new UserDeclineGameInvitation(socket));
		} catch (e) {
			;
		}
	}

}
