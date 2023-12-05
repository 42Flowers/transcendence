import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { SocketService } from 'src/socket/socket.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

/**
 * TODO: revoir le système join/create: pb sur les mdp et les invites only
*/

@Injectable()
export class RoomService {

	
	constructor(
		private readonly prismaService : PrismaService,
		private readonly messageService: MessagesService,
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2
		) {}

	async createRoom(name: string, userId: number, pwd: string): Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}});
			// let access : number = 1;
			// if (option.invite == true) {
			// 	access += 2;
			// }
			// else if (option.value !== '') {
			// 	access += 4;
			// }
			const channel = await this.prismaService.channel.create({
				data: {
					name: name,
					ownerId: user.id,
					password: pwd,
					// accessMask: access
				}
			});
			return channel.id;
		} catch (err) {
			throw new Error(err.message);
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

	async joinRoom(userId: number, channelId : number, roomname: string, pwd: string): Promise<any> {
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
			else if (channelId !== undefined) { // && this.prismaService.channelMembership.findUnique({where: {userId_channelId : {channelId : channelId, userId: userId}}}) === null
				const channel = await this.getRoom(channelId);
				if (channel !== null) {
					if (channel.accessMask !== 0) {
							if (channel.accessMask == 2) {
								throw (new Error("This is an invite only channel"));
							}
							else if (channel.accessMask == 4 && pwd !== channel.password)  {
								throw (new Error("This channel is password protected"));
							}
					}					
				}
				else {
					console.log("No channel under this id/name combination");
					this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: "No room registered under this id/name combination"});
					return null;
				}
				try {
					console.log('salut tout le monde');
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
					return channelMembership;
				} catch (error) {
					if (error instanceof Prisma.PrismaClientUnknownRequestError) {
						throw error;
					}
					else {
						this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: 'You are already in this channel'});
						console.log(error.msg);
						return;
					}
				}
			}
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
			else {
				this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: "This channel is password protected"});
				console.log(err.message);
				return;
			}
		}
	}

	async roomExists(id: number) : Promise<any> {
		return this.prismaService.channel.findUnique({where:{id: id}});
	}


	async isUserinRoom(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			return membership;
		} catch (err) {
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


	async isRoomAdmin(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			if (membership.membershipState === 2) {
				return true; 
			} return false;
		} catch (err) {
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

	async isRoomOwner(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select :{permissionMask: true}});
			if (membership.permissionMask === 4)
				return true;
			return false;
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

	async changePassword(userId: number, channelId: number, option : {invite: boolean, key: boolean, value: string}) : Promise<any> {
		try {
			const channel = await this.getRoom(channelId);
			if (channel.accessMask === 2)
				return 'cannot put a pasword on an invite only channel';
			return this.prismaService.channel.update({
				where: {id : channelId },
				data : {password : option.value}
			});
		} catch (err) {
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

	async removeUserfromRoom(userId: number, channelId: number): Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.delete({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			return membership;
		} catch (err) {
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

	/**
	 * 
	 * @param channelId 
	 * @returns list of channelMemberships and not users ?? And with the select ? 
	 */
	async getUsersfromRoom(channelId: number) : Promise<any> {
		try {
			const users = await this.prismaService.channelMembership.findMany({
				where: {channelId: channelId}});
			// users.map((user) => {
			// 	console.log(user.userId);
			// });
			return users;
		} catch (err) { throw new Error(err.message) }
	}
	
	async getRooms() : Promise<any> {
		try {
			return this.prismaService.channel.findMany({});
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async getRoom(channelId: number) : Promise<any> {
		try {
			return await this.prismaService.channel.findUnique({where: {id: channelId}});
		} catch (err) {throw new Error(err.message) }
	}


	async kickUser(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({
				where: {userId_channelId: {userId : userId, channelId: channelId}}, 
				select: {permissionMask: true}
			});
			if (this.isUserinRoom(userId, channelId) && membership.permissionMask == 0) {
				return this.prismaService.channelMembership.delete({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			}
		} catch (err) {throw new Error(err.message)}
	}

	async banUser(targetId: number, channelId: number) : Promise<any> {
		try {
			return await this.prismaService.channelMembership.update({
				where : {userId_channelId: {userId: targetId, channelId: channelId}}, 
				data: {membershipState: 4}});
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async unBanUser(targetId: number, channelId: number): Promise<any> {
		try {
			return await this.prismaService.channelMembership.update({
				where: { userId_channelId: {userId: targetId, channelId: channelId}},
				data: {membershipState : 1}
			});
		} catch (err) {throw new Error(err.message)}
	}

	async muteUser(targetId: number, channelId: number) : Promise<any> {
		try {
			if (this.isUserinRoom(targetId, channelId))
			{
				await this.prismaService.channelMembership.update({
					where: { userId_channelId:{
						userId: targetId, 
						channelId: channelId
					}},
					data: {
						membershipState: 2
					}
				});
			}
		} catch (err) {
			console.log("couldn't mute");
			throw new Error(err.message);
		}
	}

	async unMuteUser(userId: number, channelId: number) : Promise<any> {
		try {
			return await this.prismaService.channelMembership.update({
				where: {userId_channelId: {userId: userId, channelId: channelId}}, 
				data: {membershipState: 1}});
		} catch(err) {throw new Error(err.message)}
	}

	async isMute(userId:number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select: {membershipState: true}});
			if (membership === null || membership.membershipState !== 2) 
				return false;
			return true; 
		} catch (err) {throw new Error(err.message)}
	}

	async isBan(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where : {userId_channelId: {userId: userId, channelId: channelId}}, select: {membershipState: true}});
			if (membership === null ||membership.membershipState !== 4)
				return false;
			return true;
		} catch (err) {throw new Error(err.message)}
	}

	async addAdmin(channelId: number, userId: number): Promise<any> {
		try {
			if (this.isUserinRoom(userId, channelId)) {
				return await this.prismaService.channelMembership.update({
					where: { userId_channelId: {userId: userId, channelId: channelId}},
					data: {permissionMask: 2}
				});
			}
		} catch (err) {throw new Error(err.message)}
	}

	async rmvAdmin(channelId: number, userId: number) : Promise<any> {
		try {
			if (this.isUserinRoom(userId, channelId) && this.isRoomAdmin(userId, channelId)) {
				return await this.prismaService.channelMembership.update({where: {userId_channelId: {userId: userId, channelId: channelId}},
				data: {permissionMask: 1}});
			}
			else
				return 'not in room';
		} catch (err) {throw new Error(err.message)}
	}

	async addPwd(channelId: number, pwd: string) : Promise<any> {
		try {
			return await this.prismaService.channel.update({where: {id: channelId}, data: {password: pwd}});
		} catch (err) {throw err}
	}

	async rmPwd(channelId: number) : Promise<any> {
		try {
			return await this.prismaService.channel.update({where: {id: channelId}, data: {password : ''}});
		} catch (err) {throw err}
	}

	async addInvite(channelId: number) : Promise<any> {
		try {
			return await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 2}});
		} catch (err) {throw err}
	}

	async rmInvite(channelId: number) : Promise<any> {
		try {
			return await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 1}});
		} catch (err) {throw err}
	}

	async clearRooms() : Promise<any> {
		try {
			return this.prismaService.channel.deleteMany({});
		} catch (err) {throw err}
	}

	async deleteRoom(channelId: number) : Promise<any> {
		try {
			const channel = await this.prismaService.channel.findUnique({where: {id: channelId}, select: {name: true}});
			const users = await this.getUsersfromRoom(channelId);
			users.map((user) => {
				this.socketService.leaveChannel(user.id, channel.name);
			});
			this.clearUsersfromRoom(channelId);
			this.messageService.clearAllMessages(channelId);
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
				where: {userId: userId}
			});
			return channels;
		} catch (err) {
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
}