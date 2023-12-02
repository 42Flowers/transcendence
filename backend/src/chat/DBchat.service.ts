import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users_chat/DBusers.service';
import { RoomService } from '../rooms/DBrooms.service';
import { MessagesService } from '../messages/messages.service'
import { ConversationsService } from '../conversations/conversations.service'
import { SocketService } from 'src/socket/socket.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ChatChannelMessageEvent } from 'src/events/chat/channelMessage.event';
import { ChatPrivateMessageEvent } from 'src/events/chat/privateMessage.event';
import { ChatUserBlockEvent } from 'src/events/chat/userBlock.event';
import { ChatUserUnBlockEvent } from 'src/events/chat/userUnBlock.event';
import { ChatSendToClientEvent } from 'src/events/chat/sendToClient.event';
import { ChatSendPrivateMessageEvent } from 'src/events/chat/sendPrivateMessage.event';
import { ChatSendChannelMessageEvent } from 'src/events/chat/sendChannelMessage.event';

@Injectable()
export class ChatService {
	constructor(
		private readonly usersService: UsersService,
		private readonly roomService: RoomService,
		private readonly messagesService: MessagesService,
		private readonly conversationsService: ConversationsService,
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2
		) {}

	@OnEvent('chat.unblockuser')
	async chatUserUnBlock(
		event: ChatUserUnBlockEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		const target = await this.usersService.getUserById(event.targetId);
		if (await this.usersService.isUserBlocked(user.id, target.id) === false) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', target.name + " was not blocked"));
			return;
		}
		const result = await this.usersService.unBlockUser(user.id, target.id);
		if (result !== null) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', target.name + " has been successfully unblocked"));
			return;
		}
		this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', "Couldn't unblock " + target.name + ", please retry later"));
		return;
	}

	@OnEvent('chat.blockuser')
	async chatUserBlock(
		event: ChatUserBlockEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		const target = await this.usersService.getUserById(event.targetId);
		if (await this.usersService.isUserBlocked(user.id, target.id) === true) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', "You have already blocked " + target.name));
			return;
		}
		const result = await this.usersService.blockUser(user.id, target.id);
		if (result !== null) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', target.name + "has been blocked"));
			return;
		}
		this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', "Couldn't block " + target.name + ", please retry later"));
		return;
	}

	@OnEvent('chat.privatemessage')
	async chatPrivateMessage(
		event : ChatPrivateMessageEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (event.to != user?.name && event.to != '') {
			const dest = await this.usersService.getUserById(event.userId);
			if (dest != undefined) {	
				if (this.usersService.isUserBlocked(user, dest))
				{
					const msg = dest.name + " has been blocked";
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
					return;
				}
				else if (this.usersService.blockedByUser(user, dest)){
					const msg = dest.name + " has blocked you";
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
					return;
				}
				let conversation = await this.conversationsService.conversationExists(user.id, dest.id);
				if (conversation === null) {
					conversation = await this.conversationsService.createConversation(user.id, dest.id);
					const convName = await this.conversationsService.getConversationName(user.id, dest.id);
					if (convName !== null && conversation !== null)
						this.socketService.joinConversation(user.id, dest.id, convName.name);
					else {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'error', "The server failed to create this conversation, please try again later"));
						return;
					}
				}
				const newMsg = await this.messagesService.newPrivateMessage(user.id, conversation.id, event.message);
				this.eventEmitter.emit('chat.sendprivatemessage', new ChatSendPrivateMessageEvent(user.id, conversation.name, newMsg.content, newMsg.createdAt, event.options))
			} else {
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'message', "No such connected user"));
				return;
			}
		}
	}

	@OnEvent('chat.channelmessage')
	async chatChannelMessages(
		event: ChatChannelMessageEvent
	) {
		const user = await this.usersService.getUserById(event.curruser.id);
		if (await this.roomService.roomExists(event.channelId)) {
			if (await this.roomService.isUserinRoom(user.id, event.channelId)) {
				const room = await this.roomService.getRoom(event.channelId);
				if (room !== null) {
					if (await this.roomService.isMute(user.id, room.id) === true) {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'mute', "You are mute on " + room.name));
						return;
					}
					if (await this.roomService.isBan(user.id, room.id) === true) {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'ban', "You are banned from " + room.name));
						return;
					}
					const newMsg = await this.messagesService.newChannelMessage(user.id, event.channelId, event.message);
					const channelName = await this.roomService.getRoom(event.channelId);
					this.eventEmitter.emit('chat.sendchannelmessage', new ChatSendChannelMessageEvent(user.id, channelName.id, channelName.name, newMsg.content, newMsg.createdAt, event.options));
					return;
				}
			}
		}
		const msg = event.to + " does not exist or you are not a member";
		this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'channel', msg));
	}

	async chatRoom(
		// client: Socket,
		data: {userId: number, type: string, roomname: string, roomId: number, option: any},
	) {
		try {
			const user = await this.usersService.getUserById(data.userId);
			if (data.type === 'join') {
				console.log('1', data.userId);
				if (this.roomService.joinRoom(user.id, data.roomId, data.roomname, data.option)) {
					const users = await this.roomService.getUsersfromRoom(data.roomId);
					console.log("coucou" , users);
					this.socketService.joinChannel(user.id, data.roomname);
					//TODO prévenir les autres qu'il est entré dans la room.
					// this.socketGateway.server.to(data.roomname).emit('message', {from: 'server', to: 'moi', message: user.pseudo + ' has joined this room'});
					// this.socketGateway.server.to('server').emit('roomupdate', {type: 'add', room: data.roomname});
				}
				} else if(data.type === 'exit') {
					if (this.roomService.roomExists(data.roomId)){
						if (this.roomService.isUserinRoom(user.id, data.roomId)) {
							this.roomService.removeUserfromRoom(user.id, data.roomId);
							this.socketService.leaveChannel(user.id, data.roomname);
							//TODO prévenir les autres qu'il est parti.
							// this.socketGateway.server.to(data.roomname).emit('message', {from: 'server', to: 'users', message: user.pseudo + ' has left this room'});
						} else
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'channel', "You are not in this room"));
							// this.socketGateway.sendToClient(user.id, 'channel', "You are not in this room");
					} else this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'channel', "This channel does not exsits"));
						// this.socketGateway.sendToClient(user.id, 'channel', "This channel does not exsits");
				} else if (data.type === 'invite') {
					if (this.roomService.roomExists(data.roomId)) {
						if (this.roomService.isUserinRoom(user.id, data.roomId)) {
							if (this.roomService.isUserinRoom(data.option.target, data.roomId)) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'invite', data.option.target + ' is already in ' + data.roomname));
								// this.socketGateway.sendToClient(user.id, 'invite', data.option.target + ' is already in ' + data.roomname);
								return;
							} else {
						if (await this.roomService.isBan(data.option.targetId, data.roomId) === true) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'ban', data.option.target + " is banned from " + data.roomname));
							// this.socketGateway.sendToClient(user.id, 'ban', data.option.target + " is banned from " + data.roomname);
							return;
						}
						const membership = await this.roomService.joinByInvite(user.id, data.roomId, data.roomname);
						if (membership === null) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', "Server error, please retry later"));
							// this.socketGateway.sendToClient(user.id, "error", "Server error, please retry later");
							return;
						}
					}
				}
			}
		}
		else if (data.type === 'manage') {
			//! Options for owner: addadmin, kickAdmin, changePwd, addPwd, rmPwd, addInvite, rmInvite
			//! Options for administrators: kick, ban and mute (expcept for the owner, and temporally)
			if (this.roomService.roomExists(data.roomId)) {
				if (data.option.type === 'invite') {
					const target = await this.usersService.getUserById(data.option.targetId);
					if (target && !this.roomService.isUserinRoom(target.id, data.roomId)) {
						// this.socketGateway.server.to(target.id).emit('room', {type: 'invite', roomname: data.roomname});
					} 
				}
				if (this.roomService.isRoomAdmin(user, data.roomId)) {
					switch (data.option.type) {
						case 'kick': {
							const result = await this.roomService.kickUser(data.option.targetId, data.roomId);
							if (result.status === false)
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
							break;
						}
						case 'ban': {
							const result = await this.roomService.banUser(data.option.targetId, data.roomId);
							if (result.status === false)
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
							break;
						}
						case 'unban': {
							const result = await this.roomService.unBanUser(data.option.targetId, data.roomId);
							if (result.status === false) 
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
							break;
						}
						case 'mute': {
							const result = await this.roomService.muteUser(data.option.targetId, data.roomId);
							if (result.status === false)
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
							break;
						}
						case 'unmute' : {
							const result = await this.roomService.unMuteUser(data.option.targetId, data.roomId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg); 
							}
							break;
						}
						default: 
							break;
					}
					if (this.roomService.isRoomOwner(user, data.roomId)) {
						switch (data.option.type) {
							case 'addAdmin': {
								const result = await this.roomService.addAdmin(data.roomId, data.option.target);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
									// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'kickAdmin': {
								const result = await this.roomService.kickAdmin(data.roomId, data.option.target);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'addPwd': {
								const result = await this.roomService.addPwd(data.roomId, data.option.target);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'rmPwd' : {
								const result = await this.roomService.rmPwd(data.roomId);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'changePwd' : {
								const result = await this.roomService.addPwd(data.roomId, data.option.target);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'addInvite' : {
								const result = await this.roomService.addInvite(data.roomId);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'rmInvite' : {
								const result = await this.roomService.rmInvite(data.roomId);
								if (result.status === false)
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								break;
							}
							case 'delete' : {
								this.roomService.clearUsersfromRoom(data.roomId);
								const result = await this.roomService.deleteRoom(data.roomId); //vérifier qu'on a bien tout enlevé partout
								if (result.status === false) {
									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
									// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
								}
								break;
							}
							default:
								break;
						}
					}
				}
			}
			
		}}
		catch (error) {
			console.log(error.message);
			return "didn't work";
		}
	
	}

	async getPrivateConversation(
		userId: number,
		targetId: number
	){
		const conversation = await this.conversationsService.conversationExists(userId, targetId);
		console.log(conversation.receiverId);
		if (conversation) {
			return await this.messagesService.getMessagesfromConversation(userId, targetId);
		}else {
			return "No such Conversation";
		}
	}

	// chatFriend(
	// 	client: Socket,
	// 	data: {type: string, target: string, options: any}
	// ) {
	// 	const user = this.usersService.getUserById(client.id);
	// 	const target = this.usersService.getUserbyName(data.target);
	// 	if (target) {
	// 		if (data.type === 'befriend') {
	// 			if (target && !this.usersService.areFriends(user, target)) {
	// 				// if (!this.usersService.blockedByUser)
	// 				this.socketGateway.server.to(target.id).emit('friend', {type: 'request', from: user.pseudo})
	// 			}
	// 		}
	// 		else if (data.type === 'response') {
	// 			if (data.options.response === true) {
	// 				this.usersService.addFriend(user, target);
	// 			}
	// 			else {
	// 				this.socketGateway.server.to(target.id).emit('error', {errmsg: user.pseudo + " doesn't want to be your friend"});
	// 				return;
	// 			}
	// 		}
	// 		else if (data.type === 'unfriendRequest') {
	// 			//Il faut supprimer l'amitié dans le profil du user
	// 			//Envoyer la notification à l'autre qu'il faut unfriend aussi	
	// 			if (user.friends.find((user) => user.pseudo === data.options.target) !== undefined) {
	// 				const target = user.friends.find((user) => user.pseudo === data.options.target);
	// 				user.friends.splice(user.friends.indexOf(target), 1);
	// 				this.socketGateway.server.to(target.socket.id).emit('unfriend', {from: user.pseudo}); //vérifier le format de la communication.
	// 				console.log(user.friends);
	// 			}
	// 			else {
	// 				this.socketGateway.server.to(client.id).emit('error', 'This user does not exists');
	// 			}
	// 		}
	// 		else if (data.type === 'unfriended') {
	// 			if (user.friends.find((user) => user.pseudo === data.options.target) !== undefined) {
	// 				const target = user.friends.find((user) => user.pseudo === data.options.target);
	// 				user.friends.splice(user.friends.indexOf(target), 1);
	// 				this.socketGateway.server.to(user.socket.id).emit('unfriended', 'You are no longer friends with ' + target.name);
	// 				console.log(user.friends);
	// 			}
	// 			else {
	// 				const msg = 'You'
	// 				this.socketGateway.server.to(client.id).emit('error', 'You are not friend with ' + data.options.target);
	// 			}
	// 		}
	// 	}
	// 	else {
	// 		const msg = data.target + ': unknown user';
	// 		this.socketGateway.sendToClient(user.id, 'error', msg);
			
	// 	}
	// }

}
