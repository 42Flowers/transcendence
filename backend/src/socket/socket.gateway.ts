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

declare module 'socket.io' {
	interface Socket {
		user?: UserPayload;
	}
}

interface message {
    type: string, //conversation/channel
    id: number, //channelId/targetId
    authorId: number,
    authorName: string 
    message: string,
    creationTime: Date,
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

	/**
	 * 
	 * TODO Faire que ces deux fonctions renvoient le même format au front
	 * genre 'message' {type: "private/public", id: "channelId/targetId", message: string, createdAt: time, channelName?: string}
	 */

	@OnEvent('chat.sendmessage')
	sendMessage(event: ChatSendMessageEvent) 
	{
		this.server.to(event.destination).emit('message', {type: event.type, id: event.id, authorId: event.authorId, authorName: event.authorName, message: event.message, createdAt: event.createdAt});
	}

	@OnEvent('chat.sendtochannel')
	sendToChannel(event: ChatSendToChannelEvent) {
		console.log(event);
		this.server.to(event.channelName).emit('info', {type: event.type, message: event.message});
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
		@MessageBody() data: {userId: number, targetId: number, message: string},
		@ConnectedSocket() client : Socket 
	) {
		try {
			console.log(data);
			console.log('ici', this.eventEmitter.emit('chat.privatemessage', new ChatPrivateMessageEvent(data.userId, data.targetId, data.message)));
		} catch (error) {
			console.log(error.message);
		}
	}

	@SubscribeMessage('channelmessage')
	handleChannelMessage(
		@MessageBody('') data: {userId: number, channelId: number, channelName: string, message: string},
		@ConnectedSocket() client : Socket 
	) {
		console.log("arrive", client.id);
		try {
			this.eventEmitter.emit('chat.channelmessage', new ChatChannelMessageEvent(data.userId, data.channelId, data.channelName, data.message));
		} catch(error) {
			console.log(error.message);
		}
	}

	@SubscribeMessage('channelmanage')
	handleMuteOnChannel(
		@MessageBody('') data: {userId: number, type: string, channelName: string, channelId: number, options: any},
		@ConnectedSocket() client: Socket	
	) {
		
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
