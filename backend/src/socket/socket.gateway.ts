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
import { ChatSendChannelMessageEvent } from "src/events/chat/sendChannelMessage.event";
import { ChatSendPrivateMessageEvent } from "src/events/chat/sendPrivateMessage.event";

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
		private readonly eventEmitter: EventEmitter2
		) {}

	afterInit() {
		console.log("Init socket Gateway")
	}

	async handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client connected: ${client.id}`);
		//TODO rajouter socket pour chaque user, utiliser le token, trouver le moyen de le passe dans le header
		client.join('server');
		// this.socketService.addSocket(token.id, client);
	}

	async handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		client.leave('server');
		// this.socketService.removeSocket(token.id, client);
		
	}

	@OnEvent('chat.sendtoclient')
	sendToClient(event: ChatSendToClientEvent) {
		const sockets = this.socketService.getSockets(event.userId);
		sockets.map((sock) => {
			this.server.to(sock.id).emit('info', {type: event.type, msg: event.data});
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
		try {
			this.eventEmitter.emit('chat.blockuser', new ChatUserBlockEvent(data.userId, data.targetId));
		} catch (error) {
			console.log(error.message);
		}
	}

	@SubscribeMessage('unblockuser')
	handleUnBlockUser(
		@MessageBody() data: {userId: number, targetId: number}
	) {
		try {
			this.eventEmitter.emit('chat.unblockuser', new ChatUserUnBlockEvent(data.userId, data.targetId));
		} catch (error) {
			console.log(error.message);
		}
	}

	@SubscribeMessage('privatemessage')
	handlePrivateMessage(
		@MessageBody('') data: {userId: number, type: string, to: string, channelId: number, message: string, options: string},
		@ConnectedSocket() client : Socket 
	) {
		try {
			this.eventEmitter.emit('chat.privatemessage', new ChatPrivateMessageEvent(data.userId, data.type, data.to, data.channelId, data.message, data.options));
		} catch (error) {
			console.log(error.message);
		}
	}

	@SubscribeMessage('channelmessage')
	handleChannelMessage(
		@MessageBody('') data: {userId: number, type: string, to: string, channelId: number, message: string, options: string},
		@ConnectedSocket() client : Socket 
	) {
		try {
			this.eventEmitter.emit('chat.channelmessage', new ChatChannelMessageEvent(data.userId, data.type, data.to, data.channelId, data.message, data.options));
		} catch(error) {
			console.log(error.message);
		}
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
