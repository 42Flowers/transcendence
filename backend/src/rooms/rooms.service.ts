/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { SocketService } from 'src/socket/socket.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
			const user = await this.prismaService.user.findUnique({where: {id: userId}, select: {id: true}});
			let accessMask = 1;
			if (pwd != '' && pwd != null)
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
			else if (channelId !== undefined) {
				const channel = await this.getRoom(channelId);
				if (channel !== null) {
					if (channel.accessMask == 4) {
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
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select:{channelName: true, membershipState: true, permissionMask:true, channelId: true}});
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
			return users;
		} catch (err) { throw new Error(err.message) }
	}

	async getRoom(channelId: number) : Promise<any> {
		try {
			if (channelId == null)
				return null;
			return await this.prismaService.channel.findUnique({where: {id: channelId}, select: {id: true, name:true, accessMask: true}});
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
				data: {membershipState: 4, permissionMask: 1}});
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
				data: {membershipState : 1, permissionMask: 1}
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
}
