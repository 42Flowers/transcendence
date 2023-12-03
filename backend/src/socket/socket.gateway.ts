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
import { ChatChannelMessageEvent } from "src/events/chat/channelMessage.event";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ChatPrivateMessageEvent } from "src/events/chat/privateMessage.event";
import { ChatUserBlockEvent } from "src/events/chat/userBlock.event";
import { ChatUserUnBlockEvent } from "src/events/chat/userUnBlock.event";
import { ChatSendToClientEvent } from "src/events/chat/sendToClient.event";
import { GameJoinRandomEvent } from "src/events/game/joinRandom.event";
import { GameCancelSearchEvent } from "src/events/game/cancelSearch.event";
import { GameKeyUpEvent } from "src/events/game/keyUp.event";
import { GameKeyDownEvent } from "src/events/game/keyDown.event";
import { ChatSendChannelMessageEvent } from "src/events/chat/sendChannelMessage.event";
import { ChatSendPrivateMessageEvent } from "src/events/chat/sendPrivateMessage.event";
import { UserPayload } from "src/auth/user.payload";
import { JwtService } from "@nestjs/jwt";

declare module 'socket.io' {
	interface Socket {
		user?: UserPayload;
	}
}

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

	sockets: Socket[] = [];
	
	@WebSocketServer()
	server: Server;

	constructor(
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2,
		private readonly jwtService: JwtService
		) {}

	afterInit() {
		console.log("Init socket Gateway")
	}

	async handleConnection(client: Socket) {
		const { authorization: token } = client.handshake.headers;
		
		try {
			const payload = await this.jwtService.verifyAsync<UserPayload>(token);

			client.user = payload;
		} catch {
			console.warn('Socket %s disconnected : bad token', client.id);
			client.disconnect(true);
			return ;
		}

		console.log(`Client connected: ${client.id}`);

		client.join('server');
		this.socketService.addSocket(client);
	}

	async handleDisconnect(client: Socket) {
		if (!client.user) {
			return ;
		}

		client.leave('server');
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

	@OnEvent('chat.sendprivatemessage')
	sendPrivateMessage(event: ChatSendPrivateMessageEvent) {
		this.server.to(event.conversationName).emit('message', {from: event.userId, message: event.message, at: event.sentAt});
	}

	@OnEvent('chat.sendchannelmessage')
	sendChannelMessage(event: ChatSendChannelMessageEvent) {
		this.server.to(event.channelName).emit('message', {from: event.userId, message: event.message, at: event.sentAt});
	}
	// CHAT EVENTS
	
	@SubscribeMessage('blockuser')
	handleBlockUser(
		@MessageBody() data: {userId: number, targetId: number}
	) {
		this.eventEmitter.emit('chat.blockuser', new ChatUserBlockEvent(data.userId, data.targetId));
	}

	@SubscribeMessage('unblockuser')
	handleUnBlockUser(
		@MessageBody() data: {userId: number, targetId: number}
	) {
		this.eventEmitter.emit('chat.unblockuser', new ChatUserUnBlockEvent(data.userId, data.targetId));
	}

	@SubscribeMessage('privatemessage')
	handlePrivateMessage(
		@MessageBody('') data: {userId: number, type: string, to: string, channelId: number, message: string, options: string},
		@ConnectedSocket() client : Socket 
	) {
		this.eventEmitter.emit('chat.privatemessage', new ChatPrivateMessageEvent(data.userId, data.type, data.to, data.channelId, data.message, data.options));
	}

	@SubscribeMessage('channelmessage')
	handleChannelMessage(
		@MessageBody('') data: {userId: number, type: string, to: string, channelId: number, message: string, options: string},
		@ConnectedSocket() client : Socket 
	) {
		this.eventEmitter.emit('chat.channelmessage', new ChatChannelMessageEvent(data.userId, data.type, data.to, data.channelId, data.message, data.options));
	}

	// @SubscribeMessage('room')
	// // @UseGuards(AuthGuard)
	// chatRoom(
	// 	@MessageBody('') data : {userId: number, type: string, roomname: string, roomId: number, option: any},
	// 	@ConnectedSocket()  client:Socket
	// ) {
	// 	this.chatService.chatRoom(data);
	// }


	// @SubscribeMessage('friend')
	// // @UseGuards(AuthGuard)
	// chatFriend(
	// 	@MessageBody('') data: {type: string, target: string, options: string},
	// 	@ConnectedSocket() client: Socket
	// ) {
	// 	this.chatService.chatFriend(client, data);
	// }

	@SubscribeMessage('handshake')
	// @UseGuards(AuthGuard)
	chatHandshake(
		@ConnectedSocket()  client:Socket
	) {
		console.log("Received Handshake");
		return {}
	}

	// GAME EVENTS

	@SubscribeMessage("joinRandomNormal")
	onJoinRandomNormal(
		@ConnectedSocket() socket: Socket)
	{
		this.eventEmitter.emit('game.joinRandom', new GameJoinRandomEvent(socket, 0));
	}
	
	@SubscribeMessage("joinRandomSpecial")
	onRandomSpecial(
		@ConnectedSocket() socket: Socket)
	{
		this.eventEmitter.emit('game.joinRandom', new GameJoinRandomEvent(socket, 1));
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

}
