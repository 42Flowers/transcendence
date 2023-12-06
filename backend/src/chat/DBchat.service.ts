import { ChatRemoveAdminFromChannelEvent } from 'src/events/chat/removeAdminFromChannel.event';
import { ChatSendChannelMessageEvent } from 'src/events/chat/sendChannelMessage.event';
import { ChatSendPrivateMessageEvent } from 'src/events/chat/sendPrivateMessage.event';
import { ChatAddAdminToChannelEvent } from 'src/events/chat/addAdminToChannel.event';
import { ChatUnBanFromChannelEvent } from 'src/events/chat/unBanFromChannel.event';
import { ChatInviteInChannelEvent } from 'src/events/chat/inviteInChannel.event';
import { ChatKickFromChannelEvent } from 'src/events/chat/kickFromChannel.event';
import { ChatUnMuteOnChannelEvent } from 'src/events/chat/unMuteOnChannel.event';
import { ChatPrivateMessageEvent } from 'src/events/chat/privateMessage.event';
import { ChatChannelMessageEvent } from 'src/events/chat/channelMessage.event';
import { ChatRemovePasswordEvent } from 'src/events/chat/removePassword.event';
import { ChatBanFromChannelEvent } from 'src/events/chat/banFromChannel.event';
import { ChatChangePasswordEvent } from 'src/events/chat/changePassword.event';
import { ConversationsService } from '../conversations/conversations.service';
import { ChatManageChannelEvent } from 'src/events/chat/manageChannel.event';
import { ChatMuteOnChannelEvent } from 'src/events/chat/muteOnChannel.event';
import { ChatDeleteChannelEvent } from 'src/events/chat/deleteChannel.event';
import { ChatSendToClientEvent } from 'src/events/chat/sendToClient.event';
import { ChatRemoveInviteEvent } from 'src/events/chat/removeInvite.event';
import { ChatJoinChannelEvent } from 'src/events/chat/joinChannel.event';
import { ChatExitChannelEvent } from 'src/events/chat/exitChannel.event';
import { ChatUserUnBlockEvent } from 'src/events/chat/userUnBlock.event';
import { ChatAddPasswordEvent } from 'src/events/chat/addPassword.event';
import { ChatUserBlockEvent } from 'src/events/chat/userBlock.event';
import { ChatAddInviteEvent } from 'src/events/chat/addInvite.event';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
import { MessagesService } from '../messages/messages.service'
import { UsersService } from '../users_chat/DBusers.service';
import { SocketService } from 'src/socket/socket.service';
import { RoomService } from '../rooms/DBrooms.service';
import { Injectable } from '@nestjs/common';
import { ChatSendToChannelEvent } from 'src/events/chat/sendToChannel.event';

/**
 * TODO revoir tous les arguments des events, rien ne va.
 */

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
		console.log(event);
		const user = await this.usersService.getUserById(event.userId);
		if (user) {
			console.log(user);
			if (event.targetId != user.id) {
				const dest = await this.usersService.getUserById(event.targetId);
				if (dest != undefined) {
					const blocked = await this.usersService.isUserBlocked(user.id, dest.id);
					const isblocked = await this.usersService.blockedByUser(user.id, dest.id);
					if (blocked != null)
					{
						const msg = dest.name + " has been blocked";
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'blocked', msg));
						return;
					}
					else if (isblocked != null) {
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
					const newMsg = await this.messagesService.newPrivateMessage(user.id, conversation, event.message);
					console.log(newMsg);
					this.eventEmitter.emit('chat.sendprivatemessage', new ChatSendPrivateMessageEvent(user.id, conversation.name, newMsg.content, newMsg.createdAt))
				} else {
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'message', "No such connected user"));
					return;
				}
			} else {
				this.eventEmitter.emit('chat.sendToClient', new ChatSendToClientEvent(user.id, 'message', "You cannot send a message to yourself"));
			}
		} else {
			console.log("This is not a user");
		}
	}

	@OnEvent('chat.channelmessage')
	async chatChannelMessages(
		event: ChatChannelMessageEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (user != undefined) {
			const room = await this.roomService.getRoom(event.channelId);
			if (room != undefined && room.name === event.channelName) {
				const member = await this.roomService.isUserinRoom(user.id, event.channelId);
				if ( member != undefined ) {
					if (member.membershipState == 2) {
						console.log('mute');
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'mute', "You are mute on " + room.name));
						return;
					}
					if (member.membershipState === 4) {
						console.log('ban');
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'ban', "You are banned from " + room.name));
						return;
					}
					const newMsg = await this.messagesService.newChannelMessage(user.id, event.channelId, event.message);
					const channelName = await this.roomService.getRoom(event.channelId);
					this.eventEmitter.emit('chat.sendchannelmessage', new ChatSendChannelMessageEvent(user.id, channelName.id, channelName.name, newMsg.content, newMsg.createdAt));
					return;
				}
			}
			const msg = event.channelName + " does not exist or you are not a member";
			this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(user.id, 'channel', msg));
		} else {
			console.log("You are not registered");
		}
	}

	@OnEvent('chat.joinchannel') //TODO a revoir
	async joinRoom(
		event: ChatJoinChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (user != null) {
			const join = await this.roomService.joinRoom(user.id, event.channelId, event.channelName, event.pwd);
			if (join != undefined) {
				this.socketService.joinChannel(user.id, event.channelName);
				this.eventEmitter.emit('chat.sendtochannel', new ChatSendToChannelEvent(join.channelName, 'channel', user.pseudo + " joined this channel"));
			}
		}
	}

	@OnEvent('chat.exitchannel')
	async exitRoom(
		event: ChatExitChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (user != null) {
			const room = await this.roomService.roomExists(event.channelId);
			if (room != null ){
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member !== null && member.membershipState !== 4) {
					this.roomService.removeUserfromRoom(user.id, event.channelId);
					this.socketService.leaveChannel(user.id, event.channelName);
					this.eventEmitter.emit('chat.sendtochannel', new ChatSendToChannelEvent(room.name, 'channel', user.name + " has left this channel"));
				} else {
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "You are not in this room OR you are the owner and cannot leave this channel"));
				}
			} else this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'channel', "This channel does not exsits"));
		}
	}

	@OnEvent('chat.invitechannel')
	async inviteInChannel(
		event: ChatInviteInChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		const target = await this.usersService.getUserById(event.targetId);
		if (user != null && target != null) {
			const room = await this.roomService.getRoom(event.channelId);
			if (room != undefined) {
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member && (member.permissionMask >= 2) && (member.membershipState !== 4)) {
					const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (targetmember != null) {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'invite', event.targetId + ' is already in ' + event.channelName));
						return;
					} else {
						const membership = await this.roomService.joinByInvite(target.id, event.channelId, event.channelName);
						if (membership === null) {
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', "Server error, please retry later"));
							return;
						}
					}
				}
			}
		}
	}

	@OnEvent('chat.mute')
	async muteOnChannel(
		event: ChatMuteOnChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		const target = await this.usersService.getUserById(event.targetId);
		if (target != null && user != null) {
			const room = await this.roomService.roomExists(event.channelId);
			if (room != null) {
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member && member.permissionMask  >= 2) {
					const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (targetmember && (targetmember.permissionMask < member.permissionMask)) {
						const result = await this.roomService.muteUser(event.targetId, event.channelId);
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				}
			}
		}
	}
	
	@OnEvent('chat.unmute')
	async unMuteOnChannel(
		event: ChatUnMuteOnChannelEvent
	) {
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
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				}
			}
		}
	}

	@OnEvent('chat.ban')
	async banFromChannel(
		event: ChatBanFromChannelEvent
	) {
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
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				}
			}
		}
	}

	@OnEvent('chat.unban')
	async unBanFromChannel(
		event: ChatUnBanFromChannelEvent
	) {
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
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				}
			}
		}
	}

	@OnEvent('chat.kick')
	async kickFromChannel(
		event: ChatKickFromChannelEvent
	) {
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
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				}
			}
		}
	}

	@OnEvent('chat.addadmin')
	async addAdmin(
		event: ChatAddAdminToChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		const target = await this.usersService.getUserById(event.targetId);
		if (user != null && target != null) {
			const room = await this.roomService.roomExists(event.channelId);
			if (room != null) {
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member && member.permissionMask === 4) {
					console.log(target);
					const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
					console.log("coucou");
					if (targetmember && (targetmember.permissionMask < member.permissionMask) && (targetmember.membershipState !== 4)) {
						const result = await this.roomService.addAdmin(event.targetId, event.channelId);
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				} else {
					console.log("pas owner");
				}
			}
		}
	}

	@OnEvent('chat.rmadmin')
	async removeAdmin(
		event: ChatRemoveAdminFromChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		const target = await this.usersService.getUserById(event.targetId);
		if (user != null && target != null) {
			const room = await this.roomService.roomExists(event.channelId);
			if (room != null) {
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member && member.permissionMask === 4) {
					console.log(target);
					const targetmember = target.channelMemberships.find(channel => channel.channelId === event.channelId);
					if (targetmember && (targetmember.permissionMask < member.permissionMask) && (targetmember.membershipState !== 4)) {
						const result = await this.roomService.rmAdmin(event.targetId, event.channelId);
						if (result.status === false)
							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					}
				} else {
					console.log("pas owner");
				}
			}
		}
	}

	@OnEvent('chat.addpwd')
	async addPassword(
		event: ChatAddPasswordEvent
	) {
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
			}
		}
	}

	@OnEvent('chat.rmpwd')
	async removePassword(
		event: ChatRemovePasswordEvent
	) {
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
			}
		}
	}

	@OnEvent('chat.changepwd')
	async changePassword(
		event: ChatChangePasswordEvent
	) {
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
			}
		}
	}

	@OnEvent('chat.addinvite')
	async addInviteOnly(
		event: ChatAddInviteEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (user != null) {
			const room = await this.roomService.roomExists(event.channelId);
			if (room != null) {
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member != undefined && member.permissionMask == 4) {
					const result = await this.roomService.addInvite(event.channelId);
					if (result.status === false) {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					} 
				} else {
					console.log("pas owner ou pas dans le channel");
				}
			}
		}
	}

	@OnEvent('chat.rminvite')
	async removeInvite(
		event: ChatRemoveInviteEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (user != null) {
			const room = await this.roomService.roomExists(event.channelId);
			if (room != null) {
				const member = user.channelMemberships.find(channel => channel.channelId === event.channelId);
				if (member != undefined && member.permissionMask == 4 && room.accessMask == 2) {
					const result = await this.roomService.rmInvite(event.channelId);
					if (result.status === false) {
						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
					} 
				} else {
					console.log("pas owner ou pas dans le channel");
				}
			}
		}
	}

	@OnEvent('chat.delete')
	async deleteChannel(
		event: ChatDeleteChannelEvent
	) {
		const user = await this.usersService.getUserById(event.userId);
		if (await this.roomService.roomExists(event.channelId)) {
			const member = user.channelMemberships.find(channel => channel.id === event.channelId);
			if (member && member.permissionMask === 4) {
				const result = await this.roomService.deleteRoom(event.channelId);
				if (result.status === false)
					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
			} else {
				console.log("pas owner");
			}
		}
	}

	// @OnEvent('chat.managechannel')
	// async manageChannel(
	// 	event: ChatManageChannelEvent
	// ) {
	// 	//! Options for owner: addadmin, kickAdmin, changePwd, addPwd, rmPwd, addInvite, rmInvite
	// 	//! Options for administrators: kick, ban and mute (expcept for the owner, and temporally)
	// 	const user = await this.usersService.getUserById(event.userId);
	// 	if (this.roomService.roomExists(event.roomId)) {
	// 		if (event.option.type === 'invite') {
	// 			const target = await this.usersService.getUserById(event.option.targetId);
	// 			if (target && !this.roomService.isUserinRoom(target.id, event.roomId)) {
	// 			} 
	// 		}
	// 		if (this.roomService.isRoomAdmin(user, event.roomId)) {
	// 			switch (event.option.type) {
	// 				case 'kick': {
	// 					const result = await this.roomService.kickUser(event.option.targetId, event.roomId);
	// 					if (result.status === false)
	// 						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 					break;
	// 				}
	// 				case 'ban': {
	// 					const result = await this.roomService.banUser(event.option.targetId, event.roomId);
	// 					if (result.status === false)
	// 						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 					break;
	// 				}
	// 				case 'unban': {
	// 					const result = await this.roomService.unBanUser(event.option.targetId, event.roomId);
	// 					if (result.status === false) 
	// 						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 					break;
	// 				}
	// 				case 'mute': {
	// 					const result = await this.roomService.muteUser(event.option.targetId, event.roomId);
	// 					if (result.status === false)
	// 						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 					break;
	// 				}
	// 				case 'unmute' : {
	// 					const result = await this.roomService.unMuteUser(event.option.targetId, event.roomId);
	// 					if (result.status === false) {
	// 						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 					}
	// 					break;
	// 				}
	// 				default: 
	// 					break;
	// 			}
	// 			if (this.roomService.isRoomOwner(user, event.roomId)) {
	// 				switch (event.option.type) {
	// 					case 'addAdmin': {
	// 						const result = await this.roomService.addAdmin(event.roomId, event.option.target);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 							// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'kickAdmin': {
	// 						const result = await this.roomService.kickAdmin(event.roomId, event.option.target);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 						// this.socketGateway.sendToClient(event.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'addPwd': {
	// 						const result = await this.roomService.addPwd(event.roomId, event.option.target);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 						// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'rmPwd' : {
	// 						const result = await this.roomService.rmPwd(event.roomId);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 						// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'changePwd' : {
	// 						const result = await this.roomService.addPwd(event.roomId, event.option.target);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 						// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'addInvite' : {
	// 						const result = await this.roomService.addInvite(event.roomId);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 						// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'rmInvite' : {
	// 						const result = await this.roomService.rmInvite(event.roomId);
	// 						if (result.status === false)
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 						// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						break;
	// 					}
	// 					case 'delete' : {
	// 						this.roomService.clearUsersfromRoom(event.roomId);
	// 						const result = await this.roomService.deleteRoom(event.roomId); //vérifier qu'on a bien tout enlevé partout
	// 						if (result.status === false) {
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(event.userId, 'error', result.msg));
	// 							// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 						}
	// 						break;
	// 					}
	// 					default:
	// 						break;
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// async chatRoom(
	// 	// client: Socket,
	// 	data: {userId: number, type: string, roomname: string, roomId: number, option: any},
	// ) {
	// 	try {
	// 		const user = await this.usersService.getUserById(data.userId);
	// 		if (data.type === 'join') {
	// 			const join = this.roomService.joinRoom(user.id, data.roomId, data.roomname, data.option);
	// 			if (join != undefined) {
	// 				const users = await this.roomService.getUsersfromRoom(data.roomId);
	// 				this.socketService.joinChannel(user.id, data.roomname);
	// 				//TODO prévenir les autres qu'il est entré dans la room.
	// 			}
	// 		} else if(data.type === 'exit') {
	// 			if (this.roomService.roomExists(data.roomId)){
	// 				if (this.roomService.isUserinRoom(user.id, data.roomId)) {
	// 					this.roomService.removeUserfromRoom(user.id, data.roomId);
	// 					this.socketService.leaveChannel(user.id, data.roomname);
	// 					//TODO prévenir les autres qu'il est parti.
	// 				} else
	// 					this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'channel', "You are not in this room"));
	// 			} else this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'channel', "This channel does not exsits"));
	// 		} else if (data.type === 'invite') {
	// 			if (this.roomService.roomExists(data.roomId)) {
	// 				if (this.roomService.isUserinRoom(user.id, data.roomId)) {
	// 					if (this.roomService.isUserinRoom(data.option.target, data.roomId)) {
	// 						this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'invite', data.option.target + ' is already in ' + data.roomname));
	// 						return;
	// 					} else {
	// 						if (await this.roomService.isBan(data.option.targetId, data.roomId) === true) {
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'ban', data.option.target + " is banned from " + data.roomname));
	// 							return;
	// 						}
	// 						const membership = await this.roomService.joinByInvite(user.id, data.roomId, data.roomname);
	// 						if (membership === null) {
	// 							this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', "Server error, please retry later"));
	// 							return;
	// 						}
	// 					}
	// 				}
	// 			}
	// 		}
	// 		else if (data.type === 'manage') {
	// 		//! Options for owner: addadmin, kickAdmin, changePwd, addPwd, rmPwd, addInvite, rmInvite
	// 		//! Options for administrators: kick, ban and mute (expcept for the owner, and temporally)
	// 			if (this.roomService.roomExists(data.roomId)) {
	// 				if (data.option.type === 'invite') {
	// 					const target = await this.usersService.getUserById(data.option.targetId);
	// 					if (target && !this.roomService.isUserinRoom(target.id, data.roomId)) {
	// 					} 
	// 				}
	// 				if (this.roomService.isRoomAdmin(user, data.roomId)) {
	// 					switch (data.option.type) {
	// 						case 'kick': {
	// 							const result = await this.roomService.kickUser(data.option.targetId, data.roomId);
	// 							if (result.status === false)
	// 								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 							break;
	// 						}
	// 						case 'ban': {
	// 							const result = await this.roomService.banUser(data.option.targetId, data.roomId);
	// 							if (result.status === false)
	// 								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 							break;
	// 						}
	// 						case 'unban': {
	// 							const result = await this.roomService.unBanUser(data.option.targetId, data.roomId);
	// 							if (result.status === false) 
	// 								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 							break;
	// 						}
	// 						case 'mute': {
	// 							const result = await this.roomService.muteUser(data.option.targetId, data.roomId);
	// 							if (result.status === false)
	// 								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 							break;
	// 						}
	// 						case 'unmute' : {
	// 							const result = await this.roomService.unMuteUser(data.option.targetId, data.roomId);
	// 							if (result.status === false) {
	// 								this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 							}
	// 							break;
	// 						}
	// 						default: 
	// 							break;
	// 					}
	// 					if (this.roomService.isRoomOwner(user, data.roomId)) {
	// 						switch (data.option.type) {
	// 							case 'addAdmin': {
	// 								const result = await this.roomService.addAdmin(data.roomId, data.option.target);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 									// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'kickAdmin': {
	// 								const result = await this.roomService.kickAdmin(data.roomId, data.option.target);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'addPwd': {
	// 								const result = await this.roomService.addPwd(data.roomId, data.option.target);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'rmPwd' : {
	// 								const result = await this.roomService.rmPwd(data.roomId);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'changePwd' : {
	// 								const result = await this.roomService.addPwd(data.roomId, data.option.target);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'addInvite' : {
	// 								const result = await this.roomService.addInvite(data.roomId);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'rmInvite' : {
	// 								const result = await this.roomService.rmInvite(data.roomId);
	// 								if (result.status === false)
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 								// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								break;
	// 							}
	// 							case 'delete' : {
	// 								this.roomService.clearUsersfromRoom(data.roomId);
	// 								const result = await this.roomService.deleteRoom(data.roomId); //vérifier qu'on a bien tout enlevé partout
	// 								if (result.status === false) {
	// 									this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(data.userId, 'error', result.msg));
	// 									// this.socketGateway.sendToClient(data.userId, 'error', result.msg);
	// 								}
	// 								break;
	// 							}
	// 							default:
	// 								break;
	// 						}
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// 	catch (error) {
	// 		console.log(error.message);
	// 		return "didn't work";
	// 	}
	
	// }

	async getPrivateConversation(
		userId: number,
		targetId: number
	){
		let conversation = await this.conversationsService.conversationExists(userId, targetId);
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
