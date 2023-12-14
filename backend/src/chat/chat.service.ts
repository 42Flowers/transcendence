/* eslint-disable prettier/prettier */
import { ChatRemoveAdminFromChannelEvent } from 'src/events/chat/removeAdminFromChannel.event';
import { ChatAddAdminToChannelEvent } from 'src/events/chat/addAdminToChannel.event';
import { ChatUnBanFromChannelEvent } from 'src/events/chat/unBanFromChannel.event';
import { ChatKickFromChannelEvent } from 'src/events/chat/kickFromChannel.event';
import { ChatUnMuteOnChannelEvent } from 'src/events/chat/unMuteOnChannel.event';
import { ChatPrivateMessageEvent } from 'src/events/chat/privateMessage.event';
import { ChatChannelMessageEvent } from 'src/events/chat/channelMessage.event';
import { ChatRemovePasswordEvent } from 'src/events/chat/removePassword.event';
import { ChatBanFromChannelEvent } from 'src/events/chat/banFromChannel.event';
import { ChatChangePasswordEvent } from 'src/events/chat/changePassword.event';
import { ConversationsService } from '../conversations/conversations.service';
import { ChatMuteOnChannelEvent } from 'src/events/chat/muteOnChannel.event';
import { ChatDeleteChannelEvent } from 'src/events/chat/deleteChannel.event';
import { ChatSendToClientEvent } from 'src/events/chat/sendToClient.event';
import { ChatJoinChannelEvent } from 'src/events/chat/joinChannel.event';
import { ChatExitChannelEvent } from 'src/events/chat/exitChannel.event';
import { ChatAddPasswordEvent } from 'src/events/chat/addPassword.event';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
import { MessagesService } from '../messages/messages.service'
import { UsersService } from '../users_chat/users_chat.service';
import { SocketService } from 'src/socket/socket.service';
import { RoomService } from '../rooms/rooms.service';
import { Injectable } from '@nestjs/common';
import { ChatSendToChannelEvent } from 'src/events/chat/sendToChannel.event';
import { ChatSendMessageEvent } from 'src/events/chat/sendMessage.event';
import { ChatSocketJoinChannelsEvent } from 'src/events/chat/socketJoinChannels.event';
import { ChatSocketLeaveChannelsEvent } from 'src/events/chat/socketLeaveChannels.event';
import { MyError } from 'src/errors/errors';
import { ChatSendMessageToConversationdEvent } from 'src/events/chat/sendMessageToConversation.event';
import { ChatInviteInChannelEvent } from 'src/events/chat/inviteInChannel.event';
import { ChatRemoveInviteEvent } from 'src/events/chat/removeInvite.event';
import { ChatAddInviteEvent } from 'src/events/chat/addInvite.event';
import { ChatCreatePrivateChannelEvent } from 'src/events/chat/createPrivateChannel.event';


interface convElem {
    isChannel: boolean,
    channelId?: number,
    channelName?: string,
    targetId?: number
    targetName?: string,
    userPermissionMask?: number,
	users: [],
    messages: convMessage[],
}

interface convMessage {
    authorName: string,
    authorId: number,
    createdAt: Date,
    content: string,
}

@Injectable()
export class ChatService {

	constructor(
		private readonly usersService: UsersService,
		private readonly roomService: RoomService,
		private readonly messagesService: MessagesService,
		private readonly conversationsService: ConversationsService,
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2,
		) {}

	@OnEvent('chat.createprivatechannel')
	async CreatePrivateChannel(
		event: ChatCreatePrivateChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			if (user != null && event.channelName != null ) {
				const room = await this.roomService.channelExists(event.channelName);
				if (room == null) {
					const newChannel = this.roomService.createPrivateRoom(event.channelName, event.userId);
					if (newChannel != null) {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, "channel", "You have created a private channel called " + event.channelName));
					} else {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, "channel", "The creation of the " + event.channelName + " private channel failed, please try again later"));
						return;
					}
				} else{
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, "channel", "It seems " + event.channelName + " is already in use"));
					return;
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.invitechannel')
	async inviteInChannel(
		event: ChatInviteInChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			const target = await this.usersService.getUserByName(event.targetName);
			if (user != null && target != null && event.channelId != null) {
				const room = await this.roomService.getRoom(event.channelId);
				if (room != undefined) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && (member.permissionMask >= 2) && (member.membershipState !== 4)) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
						if (targetmember != undefined) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'invite', target.pseudo + ' is already in ' + room.name));
							return;
						} else {
							const membership = await this.roomService.joinByInvite(target.id, event.channelId, room.name);
							if (membership === null) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', "Server error, please retry later"));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(target.id, "join", "You have been invited in " + room.name));
						}
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.addinvite')
	async addInviteOnly(
		event: ChatAddInviteEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask  === 4) {
							const result = await this.roomService.addInvite(event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToChannelEvent(room.name, 'info', room.name + " is now a private channel"));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}catch {
			;
		}
	}

	@OnEvent('chat.rminvite')
	async removeInvite(
		event: ChatRemoveInviteEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask  === 4) {
							const result = await this.roomService.rmInvite(event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToChannelEvent(room.name, 'info', room.name + " is now a public channel"));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}catch {
			;
		}
	}


	@OnEvent('chat.socketjoinchannels')
	async socketJoinChannels(
		event: ChatSocketJoinChannelsEvent
	) {
		try {
			const channels = await this.roomService.getPublicRooms(event.userId);
			const conversations = await this.conversationsService.getAllUserConversations(event.userId);
			if (channels != null)
				channels.map(chan => event.client.join(chan.name));
			if (conversations != null)
				conversations.map(conv => event.client.join(conv.name));
		} catch {
			;
		}
	}

	@OnEvent('chat.socketleavechannels')
	async socketLeaveChannels(
		event: ChatSocketLeaveChannelsEvent
	) {
		try {
			const channels = await this.roomService.getPublicRooms(event.userId);
			const conversations = await this.conversationsService.getAllUserConversations(event.userId);
			if (channels != null)
				channels.map(chan => event.client.leave(chan.name));
			if (conversations != null)
				conversations.map(conv => event.client.leave(conv.name));
		} catch {
			;
		}
	}

	async createConversation(
		userId: number,
		targetName: string
	) {
		const target = await this.usersService.getUserByName(targetName);
		const user = await this.usersService.getUserById(userId);
		if (target == null || target == undefined) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'conversation', "This user does not exist on our database"));
			return;
		}
		if (userId == target.id) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'conversation', "You cannot start a conversation with yourself"));
			return null;
		}
		if (target != null && user != null) {
			const blocked = await this.usersService.isUserBlocked(user.id, target.id);
			const isblocked = await this.usersService.blockedByUser(user.id, target.id);
			if (blocked != null)
			{
				const msg = targetName + " is blocked";
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
				return;
			}
			else if (isblocked != null) {
				const msg = targetName + " has blocked you";
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
				return;
			}
			let conversation = await this.conversationsService.conversationExists(user.id, target.id);
			if (conversation === null) {
				conversation = await this.conversationsService.createConversation(user.id, target.id);
				const convName = await this.conversationsService.getConversationName(user.id, target.id);
				if (convName !== null && conversation !== null) {
					this.socketService.joinConversation(user.id, target.id, convName.name);
				this.eventEmitter.emit("chat.sendtoclient", new ChatSendToClientEvent(user.id, "add", "You can now talk with " + targetName))
				}
				else {
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'error', "The server failed to create this conversation, please try again later"));
					throw new MyError("The Conversation couldn't be created");
				}
			}
			return conversation;
		}
		this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'message', targetName + " is not a registered user"));
		return null;
	}

	@OnEvent('chat.privatemessage')
	async chatPrivateMessage(
		event : ChatPrivateMessageEvent
	) {
		try {
			event.message = event.message.trim();
			if (event.message.length > 100 || event.message.length < 1)
				throw new MyError("Please write a message that contains between 1 and a 100 characters");
			const user = await this.usersService.getUserById(event.userId);
			if (user) {
				if (event.targetId != user.id) {
					const dest = await this.usersService.getUserById(event.targetId);
					if (dest != undefined) {
						const blocked = await this.usersService.isUserBlocked(user.id, dest.id);
						const isblocked = await this.usersService.blockedByUser(user.id, dest.id);
						if (blocked != null)
						{
							const msg = dest.pseudo + " is blocked";
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
							return;
						}
						else if (isblocked != null) {
							const msg = dest.pseudo + " has blocked you";
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
							return;
						}
						let conversation = await this.conversationsService.conversationExists(user.id, dest.id);
						if (conversation == null) {
							throw new MyError("This Conversation does not exist");
						}
						const newMsg = await this.messagesService.newPrivateMessage(user.id, conversation.id, event.message);
						this.eventEmitter.emit('chat.sendmessage', new ChatSendMessageEvent(conversation.name, 'conversation', conversation.id, user.id, user.pseudo, newMsg.content, newMsg.createdAt, newMsg.id));
						this.eventEmitter.emit('chat.sendtoconversation', new ChatSendMessageToConversationdEvent(user.id, dest.id, "conversation", conversation.id, user.id, user.pseudo, newMsg.content, newMsg.createdAt, newMsg.id));
					} else {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'message', "No such connected user"));
						return;
					}
				} else {
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'message', "You cannot send a message to yourself"));
					return;
				}
			} else {
				throw new Error("This user could not be found in the database");
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.channelmessage')
	async chatChannelMessages(
		event: ChatChannelMessageEvent
	) {
		try {
			event.message = event.message.trim();
			if (event.message.length > 100 || event.message.length < 1)
				throw new MyError("Please write a message that contains between 1 and a 100 characters");
			const user = await this.usersService.getUserById(event.userId);
			if (user != undefined && event.channelId != null) {
				const room = await this.roomService.getRoom(event.channelId);
				if (room != undefined && room.name === room.name ) {
					const member = await this.roomService.isUserinRoom(user.id, event.channelId);
					if ( member != undefined ) {
						if (member.membershipState == 2) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'channel', "You are mute on " + room.name));
							return;
						}
						if (member.membershipState === 4) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'channel', "You are banned from " + room.name));
							return;
						}
						const newMsg = await this.messagesService.newChannelMessage(user.id, event.channelId, event.message);
						const channelName = await this.roomService.getRoom(event.channelId);
						const channelUsers = await this.roomService.getUsersFromRoomWithoutBlocked(user.id, event.channelId);
						this.eventEmitter.emit('chat.sendmessage', new ChatSendMessageEvent(channelName.name, "channel", channelName.id, user.id, user.pseudo, newMsg.content, newMsg.createdAt, newMsg.id, channelUsers));
						return;
					}
				}
				const msg = room.name + " does not exists or you are not a member";
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'channel', msg));
			} else {
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, "message", "Are you in a channel ?"));
			}
		} catch {
			;
		}
	}

	async joinRoom(userId: number, channelName: string, pwd: string) {
		try {
			const channelId = await this.roomService.getChannelId(channelName);
			const user = await this.usersService.getUserById(userId);
			if (user != null) {
				const join = await this.roomService.joinRoom(user.id, channelId, channelName, pwd);
				if (join !== undefined) {
					this.socketService.joinChannel(user.id, channelName);
					this.eventEmitter.emit('chat.sendtochannel', new ChatSendToChannelEvent(join.channelName, 'join', user.pseudo + " joined " + channelName));
					return {
						channelName,
						channelId: join.channelId,
						userPermissionMask: join.permissionMask,
						membershipState: join.membershipState,
						accessMask: (await this.roomService.getAccessMask(join.channelId)),
					};
				}
				else {
					return null;
				}
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.exitchannel')
	async exitRoom(
		event: ChatExitChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === room.id);
					if (member !== undefined && member.membershipState !== 4) {
						this.roomService.removeUserfromRoom(user.id, room.id);
						this.socketService.leaveChannel(user.id, room.name);
						this.eventEmitter.emit('chat.sendtochannel', new ChatSendToChannelEvent(room.name, 'exit', user.pseudo + " has left " + room.name));
					} else {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You are not in this room OR you are the owner and cannot leave " + room.name));
						return;
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.mute')
	async muteOnChannel(
		event: ChatMuteOnChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			const target = await this.usersService.getUserById(event.targetId);
			if (target != null && user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask  >= 2 && member.membershipState !== 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask)) {
							const result = await this.roomService.muteUser(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.targetId, "channel", "You have been muted on " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch {
			;
		}
	}
	
	@OnEvent('chat.unmute')
	async unMuteOnChannel(
		event: ChatUnMuteOnChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			const target = await this.usersService.getUserById(event.targetId);
			if (target != null && user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask  >= 2 && member.membershipState != 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && targetmember.membershipState == 2) {
							const result = await this.roomService.unMuteUser(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.targetId, "channel", "You have been unmuted on " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch {
			;
		}
	}

	async banFromChannel(userId: number, channelId: number, targetId: number) {
		try {
			const user = await this.usersService.getUserById(userId);
			const target = await this.usersService.getUserById(targetId);
			if (target != null && user != null) {
				const room = await this.roomService.roomExists(channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === channelId);
					if (member && member.permissionMask  >= 2 && member.membershipState !== 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask)) {
							const result = await this.roomService.banUser(targetId, channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(targetId, 'ban', "You have been banned from " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch {
			;
		}
	}

	async unBanFromChannel(userId: number, channelId: number, targetId: number) {
		try {
			const user = await this.usersService.getUserById(userId);
			const target = await this.usersService.getUserById(targetId);
			if (target != null && user != null) {
				const room = await this.roomService.roomExists(channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === channelId);
					if (member && member.permissionMask  >= 2 && member.membershipState != 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && targetmember.membershipState === 4) {
							const result = await this.roomService.unBanUser(targetId, channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(targetId, 'ban', "You have been unbanned from " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.kick')
	async kickFromChannel(
		event: ChatKickFromChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			const target = await this.usersService.getUserById(event.targetId);
			if (target != null && user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask  >= 2 && member.membershipState !== 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && targetmember.membershipState !== 4) {
							const result = await this.roomService.kickUser(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.targetId, 'kick', "You have been kicked from " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch {
			;
		}
	}

	async addAdmin(userId: number, channelId: number, targetId: number) {
		try {
			const user = await this.usersService.getUserById(userId);
			const target = await this.usersService.getUserById(targetId);
			if (user != null && target != null) {
				const room = await this.roomService.roomExists(channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === channelId);
					if (member && member.permissionMask >= 2 && member.membershipState !== 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && (targetmember.membershipState !== 4)) {
							const result = await this.roomService.addAdmin(targetId, channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(targetId, 'channel', "You are now admin on " + room.name));
							return;
						}
					} else {
						throw new MyError("This user is not a member OR doesn't have necessary permissions")
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch {
			;
		}
	}

	async removeAdmin(userId: number, channelId: number, targetId: number) {
		try {
			const user = await this.usersService.getUserById(userId);
			const target = await this.usersService.getUserById(targetId);
			if (user != null && target != null) {
				const room = await this.roomService.roomExists(channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === channelId);
					if (member && member.permissionMask === 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && (targetmember.membershipState !== 4)) {
							const result = await this.roomService.rmAdmin(targetId, channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(targetId, 'channel', "You are no longer admin on " + room.name));
							return;
						}
					} else {
						throw new MyError("This user is not a member OR doesn't have necessary permissions")
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.addpwd')
	async addPassword(
		event: ChatAddPasswordEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					
					if (member && member.permissionMask === 4) {
						const result = await this.roomService.addPwd(event.channelId, event.pwd);
						
						if (result.status === false) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
						}
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.rmpwd')
	async removePassword(
		event: ChatRemovePasswordEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);
			
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
			
					if (member && member.permissionMask === 4) {
						const result = await this.roomService.rmPwd(event.channelId);
			
						if (result.status === false) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
						}
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch {
			;
		}
	}

	@OnEvent('chat.changepwd')
	async changePassword(
		event: ChatChangePasswordEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);

				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				
					if (member && member.permissionMask === 4 && member.membershipState !== 4) {
						const result = await this.roomService.addPwd(event.channelId, event.pwd);
				
						if (result.status === false) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
						}
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch {
			;
		}
	}

	async deleteChannel(userId: number, channelId: number) {
		try {
			const user = await this.usersService.getUserById(userId);
			
			if (user !== null) {
				const room = await this.roomService.roomExists(channelId);
				
				if (room !== null) {
					const member = user.channelMemberships.find(channel => channel.channelId === channelId);
			
					if (member && member.permissionMask === 4) {
						const result = await this.roomService.deleteRoom(channelId);
				
						if (result.status === false) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'error', result.msg));
						}
					}
				}
			}
		} catch {
			;
		}
	}

    async getPrivateConversation(
        convId: number
    ){
        // let conversation = await this.conversationsService.conversationExists(userId, targetId);
        let conversation = await this.conversationsService.conversationExistsFromId(convId)
        if (conversation) {
            // return await this.messagesService.getMessagesfromConversation(userId, targetId);
            return await this.messagesService.getMessagesfromConversationFromConvId(convId);
        }else {
            return "No such conversation";
        }
    }
}
