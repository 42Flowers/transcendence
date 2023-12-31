/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelMembership, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MyError } from 'src/errors/errors';
import { UserJoinedChannelEvent } from 'src/events/channels/user-joined-channel.event';
import { UserLeftChannelEvent } from 'src/events/channels/user-left-channel.event';
import { ChatSendToClientEvent } from 'src/events/chat/sendToClient.event';
import { MessagesService } from 'src/messages/messages.service';
import { SocketService } from 'src/socket/socket.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomService {
	getUserName(authorId: any): any {
		throw new Error('Method not implemented.');
	}
	
	constructor(
		private readonly prismaService : PrismaService,
		private readonly messageService: MessagesService,
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2
		) {}

	async getMembershipState(channelId: number, userId: number) {
		try {
			const state = await this.prismaService.channelMembership.findUnique({
				where: {
					userId_channelId: {
						userId: userId,
						channelId: channelId
					}}, select: {
						membershipState: true 
					}
			});
			return state;
		} catch {}
	}

	async channelExists(channelName: string) : Promise<any> {
		try {
			const room = await this.prismaService.channel.findUnique({
				where: {
					name: channelName
				}
			});
			return room;
		} catch(err) {
			throw new MyError(err.message);
		}
	}

	async joinByInvite(userId: number, channelId: number, channelName: string) {
		try {
			return await this.prismaService.channelMembership.create({
				data: {
					channel: {
						connect: {
							id: channelId,
						}
					},
					channelName: channelName,
					user : {
						connect: {
							id: userId,
						}
					},
					permissionMask: 1
				}
			});
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async changeInviteOnly(userId: number, channelId: number, option: {invite: boolean, key: boolean, value: string}) : Promise<any> {
		try {
			if (option.invite === true) {
				return await this.prismaService.channel.update({
					where: {id: channelId},
					data: {accessMask: 2}
				});
			}
			else
				return await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 1}});
		} catch(err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
			else {
				this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: err.msg});
				console.log(err.message);
				return;
			}
		}
	}

	async addInvite(channelId: number) : Promise<any> {
		try {
			const chan = await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 2}});
			if (chan != null) {
				return {status: true};
			} else {
				return {status: false, msg: "Couldn't add Invite"};
			}
		} catch (err) {throw err}
	}

	async rmInvite(channelId: number) : Promise<any> {
		try {
			const chan = await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 1}});
			if (chan != null)  {
				return {status: true};
			} else {
				return {status: false, msg: "Couldn't remove InviteOnly"};
			}
		} catch (err) {throw err}
	}

	async getAccessMask(channelId: number): Promise<number> {
		try {
			const mask = await this.prismaService.channel.findUnique({
				where: {
					id: channelId
				},
				select: {
					accessMask: true
				}
			});
			
			return mask.accessMask;
		} catch {
			;
		}
	}

	async getUsersFromRoomWithoutBlocked(userId: number, channelId: number) {
		try {
			const users = await this.prismaService.channelMembership.findMany({
				where: {
					userId: {
						not: userId
					},
					membershipState: {
						not: 4,
					},
					channelId: channelId
				},
				select: {
					userId: true
				}
			})
			return users;
		} catch {
			;
		}
	}

	async getChannelId(name: string): Promise<number | undefined> {
		try {
			const chanId = await this.prismaService.channel.findUnique({
				where: {
					name,
				},
				select: {
					id: true,
				}
			});
			if (chanId === null)
				return undefined;
			return chanId.id;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientUnknownRequestError) {
				throw error;
			}
		}
		return undefined;
	}

	async createPrivateRoom(name: string, userId: number) : Promise<ChannelMembership | null> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}, select: {id: true}});
			if (name.length > 10)
				throw new MyError("A channel name can only be 10 characters long");
			const password = null;
			const channel = await this.prismaService.channel.create({
				data: {
					owner: {
						connect: {
							id: user.id
						}
					},
					name: name,
					password: password,
					accessMask: 2
				}
			});
			if (channel !== null) {
				const member = await this.prismaService.channelMembership.create({
					data: {
						user: {
							connect: {
								id: userId,
							},
						},
						channel : {
							connect: {
								id: channel.id
							}
						},
						channelName: channel.name,
						permissionMask: 4
					}
				});
				return member;
			}
			return null;
		} catch {
			throw new MyError("Could not create this channel, please try another combination");
		}
	}

	async createRoom(name: string, userId: number, pwd: string): Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}, select: {id: true}});
			if (name.length > 10)
				throw new MyError("A channel name can only be 10 characters long");
			if (pwd != '' && pwd != null) {
				if (pwd.length < 3 || pwd.length >= 20)
					throw new MyError("A channel password has to be between 3 and 20 characters");
			}
			let accessMask = 1;
			let password = null;
			if (pwd != '' && pwd != null) {
				accessMask = 4;
				password = await bcrypt.hash(pwd, 10);
			}
			const channel = await this.prismaService.channel.create({
				data: {
					name: name,
					owner: {
						connect: {
							id: user.id
						}
					},
					password: password,
					accessMask: accessMask
				}
			});
			return channel.id;
		} catch {
			throw new MyError("Could not create this channel, please try another combination");
		}
	}

	async joinRoom(userId: number, channelId: number | undefined, roomname: string, pwd: string): Promise<ChannelMembership | undefined> {
		try {
			if (channelId === undefined) {
				const channel = await this.createRoom(roomname, userId, pwd);
				if (channel !== undefined) {
					const channelMembership = await this.prismaService.channelMembership.create({
						data: {
							channelName: roomname,
							userId: userId,
							channelId: channel,
							permissionMask: 4
						}
					});
					return channelMembership;
				}
				return undefined;
			}
			else if (channelId !== undefined) {
				const channel = await this.getRoom(channelId);
				if (channel !== null) {
					if (channel.accessMask != 1) {
						if (channel.accessMask == 2) {
							throw new MyError("This channel is invite only");
						}
						else if (!await bcrypt.compare(pwd, channel.password))
							throw new MyError("This channel is password protected");
					}
				}
				else {
					throw new MyError("No channels under this id/name combination");
				}
				try {
					const channelMembership = await this.prismaService.channelMembership.create({
						data: {
							user : {
								connect: {
									id: userId,
								},
							},
							channel: {
								connect : {
									id: channelId,
								},
							},
							channelName: roomname,
							permissionMask: 1
						}
					});
					this.eventEmitter.emit('user.joined.channel', new UserJoinedChannelEvent(channelId, userId));
					return channelMembership;
				} catch (error) {
					if (error instanceof Prisma.PrismaClientUnknownRequestError) {
						throw error;
					}
					else {
						// this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'channel', "You are already in this channel"));
						throw new Error("You are already in this channel");
					}
				}
			}
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
			else {
				this.eventEmitter.emit('chat.sendtoclient', new ChatSendToClientEvent(userId, 'channel', err.message))
				return;
			}
		}
	}

	async roomExists(id: number) : Promise<any> {
        return this.prismaService.channel.findUnique({where:{id: id}, select: {name: true, id: true}});
    }

	async isUserinRoom(userId: number, channelId: number): Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select:{channelName: true, membershipState: true, permissionMask:true, channelId: true}});
			return membership;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
			else {
				return;
			}
		}
	}

	async removeUserfromRoom(userId: number, channelId: number): Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.delete({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			this.eventEmitter.emit('user.left.channel', new UserLeftChannelEvent(channelId, userId));
			return membership;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
			else {
				return;
			}
		}
	}

	async clearUsersfromRoom(channelId: number): Promise<any> {
		try {
			const memberships = await this.prismaService.channelMembership.deleteMany({
				where: {channelId: channelId}
			});
			return memberships;
		} catch(err) { 
			throw Error(err.message);
		}
	}

	async getUsersfromRoom(channelId: number) : Promise<any> {
		try {
			const users = await this.prismaService.channelMembership.findMany({
				where: {
					channelId,
				},
				select: {
					userId: true,
					membershipState:true,
					user: {
						select: {
							pseudo:true, 
							avatar: true
						}
					},
				},
			});

			return users;
		} catch (err) { throw new Error(err.message) }
	}

	async getRoom(channelId: number) : Promise<any> {
		try {
			if (channelId == null)
				return null;
			return await this.prismaService.channel.findUnique({where: {
				id: channelId
			},
			select: {
				id: true,
				name:true,
				accessMask: true,
				password: true,
			}});
		} catch (err) {throw new MyError(err.message) }
	}

	/**
	 * Forcefully deletes a channel membership
	 * @param targetId 
	 * @param channelId 
	 * @returns 
	 */
	async kickUser(targetId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.delete({
				where: {
					userId_channelId: {
						userId: targetId,
						channelId: channelId
					}
				}
			});
			if (membership !== null) {
				this.eventEmitter.emit('user.left.channel', new UserLeftChannelEvent(channelId, targetId));
				return {status: true};
			}
			else {
				return{status: false, msg: "Coulnd't kick user"};
			}
		} catch (err) {throw new Error(err.message)}
	}

	private async dispatchEventToChannelMembers(channelId: number, ev: string, ...args: any[]): Promise<boolean> {
		try {
			const members = await this.prismaService.channelMembership.findMany({
				where: {
					channelId,
				},
			});

			members.forEach(({ userId }) => {
				this.socketService.emitToUserSockets(userId, ev, ...args);
			});
		} catch {
			;
		}
		return false;
	}

	private async updateMembershipState(channelId: number, userId: number, membershipState: number): Promise<boolean> {
		try {
			const membership = await this.prismaService.channelMembership.update({
				where: {
					userId_channelId: {
						userId,
						channelId
					}
				}, 
				data: {
					membershipState,
					permissionMask: 1
				}
			});

			const membershipChanged = (null !== membership);

			if (membershipChanged) {
				this.dispatchEventToChannelMembers(channelId, 'member.update.state', {
					channelId,
					userId,
					membershipState,
				});
			}

			return membershipChanged;
		} catch {
			;
		}
		return false;
	}

	async banUser(targetId: number, channelId: number) : Promise<any> {
		try {
			if (await this.updateMembershipState(channelId, targetId, 4)) {
				return {
					status: true
				};
			} else {
				return {
					status: false,
					msg: "Couldn't ban user"
				};
			}
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async unBanUser(targetId: number, channelId: number): Promise<any> {
		try {
			if (await this.updateMembershipState(channelId, targetId, 1)) {
				return {
					status: true
				};
			} else {
				return {
					status: false,
					msg: "Couldn't unban user"
				};
			}
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async muteUser(targetId: number, channelId: number) : Promise<any> {
		try {
			if (await this.isUserinRoom(targetId, channelId))
			{
				const membership = await this.prismaService.channelMembership.update({
					where: { userId_channelId:{
						userId: targetId, 
						channelId: channelId
					}},
					data: {
						membershipState: 2
					}
				});
				if (membership != null) {
					return ({status: true});
				}
			}
			return {status: false, msg: "Couldn't be muted"};
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async unMuteUser(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.update({
				where: {userId_channelId: {userId: userId, channelId: channelId}}, 
				data: {membershipState: 1}});
			if (membership != null) {
				return {status: true};
			} else {
				return {status: false, msg: "Couldn't unmute"};
			}
		} catch(err) {throw new Error(err.message)}
	}

	async updateMemberPermissionMask(channelId: number, userId: number, permissionMask: number): Promise<boolean> {
		try {
			const membership = await this.prismaService.channelMembership.update({
				where: {
					userId_channelId: {
						userId,
						channelId,
					},
				},
				data: {
					permissionMask,
				},
			});

			const membershipUpdated = (null !== membership);
			
			if (membershipUpdated) {
				this.dispatchEventToChannelMembers(channelId, 'member.update.privileges', {
					channelId,
					userId,
					permissionMask,
				});
			}

			return membershipUpdated;
		} catch {
			;
		}
		return false;
	}

	async addAdmin(userId: number, channelId: number): Promise<any> {
		try {
			if (await this.updateMemberPermissionMask(channelId, userId, 2)) {
				return {
					status: true
				};
			} else {
				return {
					status: false,
					msg: "Could't add admin"
				};
			}
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async rmAdmin(userId: number, channelId: number) : Promise<any> {
		try {
			if (await this.updateMemberPermissionMask(channelId, userId, 1)) {
				return {
					status: true
				};
			} else {
				return {
					status: false,
					msg: "Couldn't remove admin"
				};
			}
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async addPwd(channelId: number, pwd: string) : Promise<any> {
		try {
			if (pwd.length > 20 ||pwd.length < 3) {
				throw new MyError("A channel password has to be under 20 characters");
			}
			const password = await bcrypt.hash(pwd, 10);
			const chan = await this.prismaService.channel.update({where: {id: channelId}, data: {password: password, accessMask: 4}});
			if (chan != null) {
				return {status: true};
			} else {
				return {status: false, msg: "Couldn't add password"};
			}
		} catch (err) {
			if (err instanceof MyError) {
				return {status: false, msg: err.message};
			}
			throw err
		}
	}

	async rmPwd(channelId: number) : Promise<any> {
		try {
			const chan = await this.prismaService.channel.update({where: {id: channelId}, data: {password : '', accessMask: 1}});
			if (chan != null ) {
				return {status: true};
			}
			else {
				return {status: false, msg: "Couldn't remove password"};
			}
		} catch (err) {throw err}
	}

	async deleteRoom(channelId: number): Promise<any> {
		try {
			const channel = await this.prismaService.channel.findUnique({where: {id: channelId}, select: {name: true}});
			const users = await this.getUsersfromRoom(channelId);
			users.forEach(user => {
				this.socketService.leaveChannel(user.userId, channel.name);

				/* Manually send the message to every user, kicking them out of the defunct channel */
				this.socketService.emitToUserSockets(user.userId, 'user.left.channel', {
                    channelId,
                    userId: user.userId,
                });
			});
			await this.clearUsersfromRoom(channelId);
			await this.messageService.clearAllMessages(channelId);
			return this.prismaService.channel.delete({
				where: {id: channelId}
			});
		} catch (err) {
			throw err
		}
	}

	async getPublicRooms(userId: number) : Promise<any> {
		try {
			const channels = await this.prismaService.channelMembership.findMany({
				where: {userId: userId},
			});

			return channels;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
		}
	}

	async getPublicRoomsWhereNotBanned(userId: number) : Promise<any> {
		try {
			const channels = await this.prismaService.channelMembership.findMany({
				where: {
					userId: userId,
					membershipState: {
						not: 4
					}
				},
			});

			return channels;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
		}
	}
}
