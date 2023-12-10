/* eslint-disable prettier/prettier */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { SocketService } from 'src/socket/socket.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';
import { MyError } from 'src/errors/errors';

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

	async getAccessMask(channelId: number) {
		try {
			const mask = await this.prismaService.channel.findUnique({where: {id: channelId}, select: {accessMask: true}});
			return mask;
		} catch (error) {
			console.log(error.message);
		}
	}

	async getUsersFromRoomWithoutBlocked(userId: number, channelId: number) {
		try {
			const users = await this.prismaService.channelMembership.findMany({
				where: {
					userId: {
						not: userId
					},
					channelId: channelId
				},
				select: {
					userId: true
				}
			})
			console.log(users);
			return users;
		} catch(error) {
			console.log(error);
		}
	}

	async getChannelId(name: string) {
		try{
			const chanId = await this.prismaService.channel.findUnique({where: {name: name}, select: {id: true}});
			if (chanId == null)
				return undefined;
			return chanId.id;
		}catch( error) {
			if (error instanceof Prisma.PrismaClientUnknownRequestError) {
				throw error;
			}
			else 
			console.log(error.message);
		}
	}

	async createRoom(name: string, userId: number, pwd: string): Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({where: {id: userId}});
			let accessMask = 1;
			if (pwd != '')
				accessMask = 4;
			const password = await bcrypt.hash(pwd, 10);
			const channel = await this.prismaService.channel.create({
				data: {
					name: name,
					ownerId: user.id,
					password: password,
					accessMask: accessMask
				}
			});
			return channel.id;
		} catch (err) {
			throw new MyError("Could not create this channel, please try another combination");
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
								throw (new MyError("This is an invite only channel"));
							}
							if (!await bcrypt.compare(pwd, channel.password))
								throw new MyError("This channel is password protected");
					}
				}
				else {
					this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: "No room registered under this id/name combination"});
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
					return channelMembership;
				} catch (error) {
					if (error instanceof Prisma.PrismaClientUnknownRequestError) {
						throw error;
					}
					else {
						this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: 'You are already in this channel'});
						throw new MyError("User already in channel");
					}
				}
			}
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw Error(err.message);
			}
			else {
				this.eventEmitter.emit('sendtoclient', userId, 'info', {type: 'channel', msg: err.message});
				console.log(err.message);
				return;
			}
		}
	}

	async roomExists(id: number) : Promise<any> {
        return this.prismaService.channel.findUnique({where:{id: id}, select: {name: true, id: true}});
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
			if (channelId != null) {
				const channel = await this.getRoom(channelId);
				if (channel.accessMask === 2)
					return 'cannot put a pasword on an invite only channel';
				return this.prismaService.channel.update({
					where: {id : channelId },
					data : {password : option.value}
				});
			}
			else {
				throw new MyError("Undefined channelId");
			}
		} catch (err) {
			if (err instanceof Prisma.PrismaClientUnknownRequestError) {
				throw new Error(err.message);
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
				where: {channelId: channelId},
				select: {
					userId: true,
					membershipState:true,
					user: {select: {
						pseudo:true, 
						avatar: true
					}},
				},
				});
				console.log(users);
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
			if (channelId == null)
				return null;
			return await this.prismaService.channel.findUnique({where: {id: channelId}});
		} catch (err) {throw new MyError(err.message) }
	}


	async kickUser(userId: number, channelId: number) : Promise<any> {
		try {
			const membership = await  this.prismaService.channelMembership.delete({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			if (membership != null) {
				return {status: true};
			}
			else {
				return{status: false, msg: "Coulnd't kick user"};
			}
		} catch (err) {throw new Error(err.message)}
	}

	async banUser(targetId: number, channelId: number) : Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.update({
				where : {userId_channelId: {userId: targetId, channelId: channelId}}, 
				data: {membershipState: 4}});
			if (membership != null) {
				return {status: true};
			}
			else {
				return {status: false, msg: "Couldn't ban user"};
			}
		} catch (err) {
			throw new Error(err.message);
		}
	}

	async unBanUser(targetId: number, channelId: number): Promise<any> {
		try {
			const membership = await this.prismaService.channelMembership.update({
				where: { userId_channelId: {userId: targetId, channelId: channelId}},
				data: {membershipState : 1}
			});
			if (membership != null) {
				return {status: true};
			}
			else {
				return {status: false, msg: "Couldn't ban user"};
			}
		} catch (err) {throw new Error(err.message)}
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
			console.log("couldn't mute");
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

	async addAdmin(userId: number, channelId: number): Promise<any> {
		try {
			const membership =  await this.prismaService.channelMembership.update({
				where: { userId_channelId: {userId: userId, channelId: channelId}},
				data: {permissionMask: 2}
			});
			if (membership != null) {
				return {status: true};
			} else {
				return {status: false, msg: "Could't add admin"};
			}
		} catch (err) {throw new Error(err.message)}
	}

	async rmAdmin(userId: number, channelId: number) : Promise<any> {
		try {
			const membership =  await this.prismaService.channelMembership.update({where: {userId_channelId: {userId: userId, channelId: channelId}},
			data: {permissionMask: 1}});
			if (membership != null) {
				return {status: true};
			} else {
				return {status: false, msg: "Couldn't remove admin"};
			}
		} catch (err) {throw new Error(err.message)}
	}

	async addPwd(channelId: number, pwd: string) : Promise<any> {
		try {
			const chan = await this.prismaService.channel.update({where: {id: channelId}, data: {password: pwd, accessMask: 4}});
			if (chan != null) {
				return {status: true};
			} else {
				return {status: false, msg: "Couldn't add password"};
			}
		} catch (err) {throw err}
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
				this.socketService.leaveChannel(user.user.id, channel.name);
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


	async addSocketToAllChannels(client: Socket, userId: number) {
		try {
			const memberships = await this.prismaService.channelMembership.findMany({
				where: {
					userId: userId
				},
				select: {
					channelId: true
				}
			});
			const names = await Promise.all(memberships.map((chan, index) => this.prismaService.channel.findUnique({where: {id: memberships[index].channelId}})));
			console.log(names);
			// memberships.channel.
		} catch(error) {
			throw new Error(error.message);
		}
	}
}
