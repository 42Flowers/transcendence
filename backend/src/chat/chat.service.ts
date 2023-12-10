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
import { ChatUserUnBlockEvent } from 'src/events/chat/userUnBlock.event';
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
    creationTime: Date,
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

	@OnEvent('chat.socketjoinchannels')
	async socketJoinChannels(
		event: ChatSocketJoinChannelsEvent
	) {
		try {
			const channels = await this.roomService.getPublicRooms(event.userId);
			const conversations = await this.conversationsService.getAllUserConversations(event.userId);
			// console.log(channels, conversations);
			if (channels != null)
				channels.map(chan => event.client.join(chan.name));
			if (conversations != null)
				conversations.map(conv => event.client.join(conv.name));
		} catch(error) {
			console.log(error.message);
		}
	}

	@OnEvent('chat.socketleavechannels')
	async socketLeaveChannels(
		event: ChatSocketLeaveChannelsEvent
	) {
		try {
			const channels = await this.roomService.getPublicRooms(event.userId);
			const conversations = await this.conversationsService.getAllUserConversations(event.userId);
			// console.log(channels, conversations);
			if (channels != null)
				channels.map(chan => event.client.leave(chan.name));
			if (conversations != null)
				conversations.map(conv => event.client.leave(conv.name));
		} catch (error) {
			console.log(error.message);
		}
	}

	async createConversation(
		userId: number,
		targetName: string
	) {
		const target = await this.usersService.getUserByName(targetName);
		const user = await this.usersService.getUserById(userId);
		if (userId == target.id) {
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'conversation', "You cannot start a conversation with yourself"));
			return null;
		}
		if (target != null && user != null) {
			const blocked = await this.usersService.isUserBlocked(user.id, target.id);
			const isblocked = await this.usersService.blockedByUser(user.id, target.id);
			if (blocked != null)
			{
				const msg = target.pseudo + " is blocked";
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
				return;
			}
			else if (isblocked != null) {
				const msg = target.pseudo + " has blocked you";
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
				return;
			}
			let conversation = await this.conversationsService.conversationExists(user.id, target.id);
			if (conversation === null) {
				conversation = await this.conversationsService.createConversation(user.id, target.id);
				const convName = await this.conversationsService.getConversationName(user.id, target.id);
				if (convName !== null && conversation !== null) {
					this.socketService.joinConversation(user.id, target.id, convName.name);
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
			if (event.message.length > 100)
				throw new MyError("This message is too long");
			const user = await this.usersService.getUserById(event.userId);
			console.log(event.message, event.message.length);
			if (user) {
				if (event.targetId != user.id) {
					const dest = await this.usersService.getUserById(event.targetId);
					if (dest != undefined) {
						const blocked = await this.usersService.isUserBlocked(user.id, dest.id);
						const isblocked = await this.usersService.blockedByUser(user.id, dest.id);
						if (blocked != null)
						{
							const msg = dest.name + " is blocked";
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
							return;
						}
						else if (isblocked != null) {
							const msg = dest.name + " has blocked you";
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
							return;
						}
						let conversation = await this.conversationsService.conversationExists(user.id, dest.id);
						console.log(conversation);
						if (conversation == null) {
							throw new MyError("This Conversation does not exist");
						}
						const newMsg = await this.messagesService.newPrivateMessage(user.id, conversation.id, event.message);
						this.eventEmitter.emit('chat.sendmessage', new ChatSendMessageEvent(conversation.name, 'conversation', conversation.id, user.id, user.pseudo, newMsg.content, newMsg.createdAt, newMsg.id));
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
		}catch (error) {
			console.log(error.message);
		}
	}

	@OnEvent('chat.channelmessage')
	async chatChannelMessages(
		event: ChatChannelMessageEvent
	) {
		try {
			if (event.message.length > 100)
				throw new MyError("This message is too long");
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
						this.eventEmitter.emit('chat.sendmessage', new ChatSendMessageEvent(channelName.name, "channel", channelName.id, newMsg.id, user.id, user.pseudo, newMsg.content, newMsg.createdAt, channelUsers));
						return;
					}
				}
				const msg = room.name + " does not exists or you are not a member";
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'channel', msg));
			} else {
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, "message", "You are unknowwn to the database"));
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.joinchannel')
	async joinRoom(
		event: ChatJoinChannelEvent
	) {
		try {
			const channelId = await this.roomService.getChannelId(event.channelName);
			const user = await this.usersService.getUserById(event.userId);
			if (user != null) {
				const join = await this.roomService.joinRoom(user.id, channelId, event.channelName, event.pwd);
				if (join != undefined) {
					this.socketService.joinChannel(user.id, event.channelName);
					this.eventEmitter.emit('chat.sendtochannel', new ChatSendToChannelEvent(join.channelName, 'channel', user.pseudo + " joined this channel"));
				}
			}
		} catch (err) {
			console.log(err.message);
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
				if (room != null ){
					const member = user.channelMemberships.find(channel => channel.channelId === room.id);
					if (member !== undefined && member.membershipState !== 4) {
						this.roomService.removeUserfromRoom(user.id, room.id);
						this.socketService.leaveChannel(user.id, room.name);
						this.eventEmitter.emit('chat.sendtochannel', new ChatSendToChannelEvent(room.name, 'channel', user.pseudo + " has left this channel"));
					} else {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You are not in this room OR you are the owner and cannot leave this channel"));
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
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
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, "channel", "You have been muted on " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch (err) {
			console.log(err.message);
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
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, "channel", "You have been unmuted on " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.ban')
	async banFromChannel(
		event: ChatBanFromChannelEvent
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
							const result = await this.roomService.banUser(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You have been banned from " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.unban')
	async unBanFromChannel(
		event: ChatUnBanFromChannelEvent
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
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && targetmember.membershipState === 4) {
							const result = await this.roomService.unBanUser(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You have been unbanned from " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch (err) {
			console.log(err.message);
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
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You have been kicked from " + room.name));
							return;
						}
					}
				} else {
					throw new MyError("This user is not a member OR doesn't have necessary permissions")
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.addadmin')
	async addAdmin(
		event: ChatAddAdminToChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			const target = await this.usersService.getUserById(event.targetId);
			if (user != null && target != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask >= 2 && member.membershipState !== 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && (targetmember.membershipState !== 4)) {
							const result = await this.roomService.addAdmin(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You are now admin on " + room.name));
							return;
						}
					} else {
						throw new MyError("This user is not a member OR doesn't have necessary permissions")
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.rmadmin')
	async removeAdmin(
		event: ChatRemoveAdminFromChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			const target = await this.usersService.getUserById(event.targetId);
			if (user != null && target != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask === 4) {
						const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
						if (targetmember && (targetmember.permissionMask < member.permissionMask) && (targetmember.membershipState !== 4)) {
							const result = await this.roomService.rmAdmin(event.targetId, event.channelId);
							if (result.status === false) {
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
								return;
							}
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You are no longer admin on " + room.name));
							return;
						}
					} else {
						throw new MyError("This user is not a member OR doesn't have necessary permissions")
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
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
							if (result.status === false)
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
						} else {
						console.log("pas owner");
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
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
							if (result.status === false)
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
						} else {
						console.log("pas owner");
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
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
							if (result.status === false)
								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
						} else {
						console.log("pas owner");
					}
				} else {
					throw new MyError("This channel does not exist");
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	@OnEvent('chat.delete')
	async deleteChannel(
		event: ChatDeleteChannelEvent
	) {
		try {
			const user = await this.usersService.getUserById(event.userId);
			if (user != null) {
				const room = await this.roomService.roomExists(event.channelId);
				if (room != null) {
					const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (member && member.permissionMask === 4) {
						const result = await this.roomService.deleteRoom(event.channelId);
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					} else {
						console.log("pas owner");
					}
				}
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	async getPrivateConversation(
		userId: number,
		targetId: number
	){
		let conversation = await this.conversationsService.conversationExists(userId, targetId);
		if (conversation) {
			return await this.messagesService.getMessagesfromConversation(userId, targetId);
		}else {
			return "No such conversation";
		}
	}
}
