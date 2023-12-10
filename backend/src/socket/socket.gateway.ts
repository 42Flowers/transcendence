import { Server, Socket } from "socket.io";
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
import { Injectable } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { GameKeyUpEvent } from "src/events/game/keyUp.event";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { GameKeyDownEvent } from "src/events/game/keyDown.event";
import { ChatUserBlockEvent } from "src/events/chat/userBlock.event";
import { GameJoinRandomEvent } from "src/events/game/joinRandom.event";
import { ChatUserUnBlockEvent } from "src/events/chat/userUnBlock.event";
import { GameCancelSearchEvent } from "src/events/game/cancelSearch.event";
import { ChatSendToClientEvent } from "src/events/chat/sendToClient.event";
import { ChatChannelMessageEvent } from "src/events/chat/channelMessage.event";
import { ChatPrivateMessageEvent } from "src/events/chat/privateMessage.event";
import { UserPayload } from "src/auth/user.payload";
import { JwtService } from "@nestjs/jwt";
import { GameInviteToNormal } from "src/events/game/inviteToNormalGame.event";
import { GameJoinInvite } from "src/events/game/joinInvite.event";
import { GameInviteToSpecial } from "src/events/game/inviteToSpecialGame.event";
import { ChatSendToChannelEvent } from "src/events/chat/sendToChannel.event";
import { ChatSendMessageEvent } from "src/events/chat/sendMessage.event";
import { PrismaService } from "src/prisma/prisma.service";
import { Game, GameMode } from "src/game/game";
import { ChatSendRoomToClientEvent } from "src/events/chat/sendRoomToClient.event";
import { ChatSocketJoinChannelsEvent } from "src/events/chat/socketJoinChannels.event";
import { ChatSocketLeaveChannelsEvent } from "src/events/chat/socketLeaveChannels.event";
import { v4 as uuidv4 } from 'uuid';

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

import { IsString, IsNumber, IsNotEmpty, Min, Max, MaxLength, ValidationOptions, registerDecorator, ValidationArguments, IsAscii } from 'class-validator';

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

export class PrivateMessageDTO {
	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	targetId: number

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	@IsAscii()
	message: string
};

export class ChannelMessageDTO {
	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	channelId: number

	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	@IsNoSpecialCharactersChat()
	channelName: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	@IsAscii()
	message: string
};

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
		console.log(`Client connected: ${client.id}`);
		client.join('server');
		this.socketService.addSocket(client);
		this.eventEmitter.emit('chat.socketjoinchannels', new ChatSocketJoinChannelsEvent(Number(client.user.sub), client))
	}

	async handleDisconnect(client: Socket) {
		if (!client.user) {
			return ;
		}
		client.leave('server');
		this.eventEmitter.emit('chat.socketleavechannels', new ChatSocketLeaveChannelsEvent(Number(client.user.sub), client));
		this.socketService.removeSocket(client);
		console.log(`Client disconnected: ${client.id}`);		
		// this.socketService.removeSocket(token.id, client);
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
		this.server.to(dest).emit('message', {type: event.type, id: event.id, msgId: event.msgId, authorId: event.authorId, authorName: event.authorName, message: event.message, createdAt: event.createdAt});
		if (event.type == "channel") {
			event.channelUsers.forEach(user => {
				this.socketService.leaveChannel(user.userId, dest);
			})
		}
	}

	@OnEvent('chat.sendtochannel')
	sendToChannel(event: ChatSendToChannelEvent) {
		this.server.to(event.channelName).emit('info', {type: event.type, message: event.message});
	}

	// CHAT EVENTS

	@SubscribeMessage('blockuser')
	handleBlockUser(
		@MessageBody() data: {targetId: number},
		@ConnectedSocket() client: Socket 
	) {
		try {
			const userId = Number(client.user.sub);
			if (userId == undefined)
				return;
			this.eventEmitter.emit('chat.blockuser', new ChatUserBlockEvent(userId, data.targetId));
		} catch (err) {
			console.log(err.message);
		}
	}

	@SubscribeMessage('unblockuser')
	handleUnBlockUser(
		@MessageBody() data: {targetId: number},
		@ConnectedSocket() client: Socket
	) {
		try {
			const userId = Number(client.user.sub);
			if (userId == undefined)
				return;
			this.eventEmitter.emit('chat.unblockuser', new ChatUserUnBlockEvent(userId, data.targetId));
		} catch (err) {
			console.log(err.message);
		}
	}

	@SubscribeMessage('privatemessage')
	handlePrivateMessage(
		@MessageBody() dto: PrivateMessageDTO,
		@ConnectedSocket() client : Socket 
	) {
		const userId = Number(client.user.sub);
		if (userId == undefined)
			return;
		try {
			this.eventEmitter.emit('chat.privatemessage', new ChatPrivateMessageEvent(userId, dto.targetId, dto.message));
		} catch (err) {
			console.log(err.message);
		}
	}

	@SubscribeMessage('channelmessage')
	handleChannelMessage(
		@MessageBody() dto : ChannelMessageDTO,
		@ConnectedSocket() client : Socket 
	) {
		const userId = Number(client.user.sub);
		if (userId == undefined)
			return;
		try {
			this.eventEmitter.emit('chat.channelmessage', new ChatChannelMessageEvent(userId, dto.channelId, dto.message));
		} catch (err) {
			console.log(err.message);
		}
	}

	@SubscribeMessage('handshake')
	// @UseGuards(AuthGuard)
	chatHandshake(
		@ConnectedSocket() client: Socket
	) {
		console.log("Received Handshake");
		return {}
	}

	// GAME EVENTS

	@SubscribeMessage("joinRandomNormal")
	onJoinRandomNormal(
		@ConnectedSocket() socket: Socket)
	{
		this.eventEmitter.emit('game.joinRandom', new GameJoinRandomEvent(socket, GameMode.Normal));
	}
	
	@SubscribeMessage("joinRandomSpecial")
	onRandomSpecial(
		@ConnectedSocket() socket: Socket)
	{
		this.eventEmitter.emit('game.joinRandom', new GameJoinRandomEvent(socket, GameMode.Special));
	}

	@SubscribeMessage('cancelGameSearch')
	onCancelSearch(
		@ConnectedSocket() socket: Socket)
	{
		this.eventEmitter.emit('game.cancelSearch', new GameCancelSearchEvent(socket));
	}

	@SubscribeMessage("keyUp")
	onKeyUp(
		@ConnectedSocket() socket: Socket,
		@MessageBody() key: string)
	{
		this.eventEmitter.emit('game.keyUp', new GameKeyUpEvent(socket, key));
	}

	@SubscribeMessage("keyDown")
	onKeyDown(
		@ConnectedSocket() socket: Socket,
		@MessageBody() key: string)
	{
		this.eventEmitter.emit('game.keyDown', new GameKeyDownEvent(socket, key));
	}

	@SubscribeMessage("inviteNormal")
	onInviteNormal(
		@ConnectedSocket() socket: Socket,
		@MessageBody() targetId: number,
	)
	{
		this.eventEmitter.emit('game.inviteToNormal', new GameInviteToNormal(socket, targetId));
	}
	
	@SubscribeMessage("inviteSpecial")
	onInviteSpecial(
		@ConnectedSocket() socket: Socket,
		@MessageBody() targetId: number,
	)
	{
		this.eventEmitter.emit('game.inviteToSpecial', new GameInviteToSpecial(socket, targetId));
	}

	@SubscribeMessage("joinInviteGame")
	onJoinInviteGame(
		@ConnectedSocket() socket: Socket
	)
	{
		this.eventEmitter.emit('game.joinInvite', new GameJoinInvite(socket));
	}

}
