import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from 'src/messages/messages.service';
import { User } from 'src/users_chat/user.model';
import { userInfo } from 'os';
import { SocketService } from 'src/socket/socket.service';
import { Prisma } from '@prisma/client';

// /**
//  * TODO Mettre le masque des permissions quand création ou join de channel
//	TODO les erreurs purée
//  */

@Injectable()
export class RoomService {

	
	constructor(
		private readonly prismaService : PrismaService,
		private readonly messageService: MessagesService,
		private readonly socketService: SocketService
		) {}

	async createRoom(name: string, userId: number, option: {invite: boolean, value: string}): Promise<any> {
		const user = await this.prismaService.user.findUnique({where: {id: userId}});
		let access : number = 1;
		if (option.invite == true) {
			access += 2;
		}
		else if (option.value !== '') {
			access += 4;
		}
		const channel = await this.prismaService.channel.create({
			data: {
				name: name,
				ownerId: user.id,
				password: option.value,
				accessMask: access
			}
		});
		return channel.id;
	}

	async joinByInvite(userId: number, channelId: number, channelName: string) {
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
	}

	async joinRoom(userId: number, channelId : number, roomname: string, option : {invite: boolean, key: boolean, value: string}): Promise<any> {
		if (channelId === undefined) {
			const channel = await this.createRoom(roomname, userId, option);
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
			console.log('ici', userId, channelId);
			const channel = await this.getRoom(channelId);
			if (channel.accessMask !== 0) {
					if (channel.accessMask == 2)
						return; //error, invite only
					else if (channel.accessMask == 4 && option.value !== channel.password)
						return; //error, pas le bon mot de passe
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
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					throw new Error('User is already a user in this channel');
				}
			}
		}
		else {
			return 'already in the channel';
		}
	}

	async roomExists(id: number) : Promise<any> {
		return this.prismaService.channel.findUnique({where:{id: id}});
	}


	async isUserinRoom(userId: number, channelId: number) : Promise<any> {
		return await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}});
	}


	async isRoomAdmin(userId: number, channelId: number) : Promise<any> {
		const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}});
		if (membership.membershipState === 2)
			return true;
		return false;
	}

	async isRoomOwner(userId: number, channelId: number) : Promise<any> {
		const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select :{permissionMask: true}});
		if (membership.permissionMask === 4)
			return true;
		return false;
	}

	async changePassword(channelId: number, option : {invite: boolean, key: boolean, value: string}) : Promise<any> {
		const channel = await this.getRoom(channelId);
		if (channel.accessMask === 2)
			return 'cannot put a pasword on an invite only channel';
		return this.prismaService.channel.update({
			where: {id : channelId },
			data : {password : option.value}
		});
	}

	async changeInviteOnly(channelId: number, option: {invite: boolean, key: boolean, value: string}) : Promise<any> {
		if (option.invite === true) {
			return await this.prismaService.channel.update({
				where: {id: channelId},
				data: {accessMask: 2}
			});
		}
		else
			return await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 1}});
	}

	async removeUserfromRoom(userId: number, channelId: number): Promise<any> {
		return await this.prismaService.channelMembership.delete({where: {userId_channelId: {userId: userId, channelId: channelId}}});
	}

	async clearUsersfromRoom(channelId: number): Promise<any> {
		return await this.prismaService.channelMembership.deleteMany({
			where: {channelId: channelId}
		});
	}

	/**
	 * 
	 * @param channelId 
	 * @returns list of channelMemberships and not users ?? And with the select ? 
	 */
	async getUsersfromRoom(channelId: number) : Promise<any> {
		console.log(channelId);
		const users = await this.prismaService.channelMembership.findMany({
			where: {channelId: channelId}});
		users.map((user) => {
			console.log(user.userId);
		});
		return users;
	}
	
	async getRooms() : Promise<any> {
		return this.prismaService.channel.findMany({});
	}

	async getRoom(channelId: number) : Promise<any> {
		return await this.prismaService.channel.findUnique({where: {id: channelId}});
	}


	async kickUser(userId: number, channelId: number) : Promise<any> {
			const membership = await this.prismaService.channelMembership.findUnique({
				where: {userId_channelId: {userId : userId, channelId: channelId}}, 
				select: {permissionMask: true}
			});
			if (this.isUserinRoom(userId, channelId) && membership.permissionMask == 0) {
				return this.prismaService.channelMembership.delete({where: {userId_channelId: {userId: userId, channelId: channelId}}});
			}
	}

	async banUser(targetId: number, channelId: number) : Promise<any> {
		return await this.prismaService.channelMembership.update({
			where : {userId_channelId: {userId: targetId, channelId: channelId}}, 
			data: {membershipState: 4}});
	}

	async unBanUser(targetId: number, channelId: number): Promise<any> {
		return await this.prismaService.channelMembership.update({
			where: { userId_channelId: {userId: targetId, channelId: channelId}},
			data: {membershipState : 1}
		});
	}

	async muteUser(targetId: number, channelId: number) : Promise<any> {
		if (this.isUserinRoom(targetId, channelId))
		{
			const mute = await this.prismaService.channelMembership.update({
				where: { userId_channelId:{
					userId: targetId, 
					channelId: channelId
				}},
				data: {
					membershipState: 2
				}
			});
		}
	}

	async unMuteUser(userId: number, channelId: number) : Promise<any> {
		return await this.prismaService.channelMembership.update({
			where: {userId_channelId: {userId: userId, channelId: channelId}}, 
			data: {membershipState: 1}});
	}

	async isMute(userId:number, channelId: number) : Promise<any> {
		const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select: {membershipState: true}});
		if (membership === null || membership.membershipState !== 2) 
			return false;
		return true;
	}

	async isBan(userId: number, channelId: number) : Promise<any> {
		const membership = await this.prismaService.channelMembership.findUnique({where : {userId_channelId: {userId: userId, channelId: channelId}}, select: {membershipState: true}});
		if (membership === null ||membership.membershipState !== 4)
			return false;
		return true;
	}

	async addAdmin(channelId: number, userId: number): Promise<any> {
		if (this.isUserinRoom(userId, channelId)) {
			return await this.prismaService.channelMembership.update({
				where: { userId_channelId: {userId: userId, channelId: channelId}},
				data: {permissionMask: 2}
			});
		}
	}

	async kickAdmin(channelId: number, userId: number) : Promise<any> {
		if (this.isUserinRoom(userId, channelId) && this.isRoomAdmin(userId, channelId)) {
			return await this.prismaService.channelMembership.update({where: {userId_channelId: {userId: userId, channelId: channelId}},
			data: {permissionMask: 1}});
		}
		else
			return 'not in room';
	}

	async addPwd(channelId: number, pwd: string) : Promise<any> {
		return await this.prismaService.channel.update({where: {id: channelId}, data: {password: pwd}});
	}

	async rmPwd(channelId: number) : Promise<any> {
		return await this.prismaService.channel.update({where: {id: channelId}, data: {password : ''}});
	}

	async addInvite(channelId: number) : Promise<any> {
		return await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 1}});
	}

	async rmInvite(channelId: number) : Promise<any> {
		return await this.prismaService.channel.update({where: {id: channelId}, data: {accessMask: 0}});
	}

	async clearRooms() : Promise<any> {
		return this.prismaService.channel.deleteMany({});
	}

	async deleteRoom(channelId: number) : Promise<any> {
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
	}

	async getPublicRooms(userId: number) : Promise<any> {
		try {
			const channels =  await this.prismaService.channel.findMany({
				where: {
					accessMask: 1,
					memberships: {
						none: {
							userId,
						},
					},
				},
			});
			console.log(channels);
			return channels;
		} catch (err) {
			throw (new Error(err.message));
		}
	}
}