/* eslint-disable prettier/prettier */
import { SocketService } from 'src/socket/socket.service';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {MyError } from '../errors/errors'


@Injectable()
export class UsersService {

	constructor(
		private readonly prismaService : PrismaService,
		private readonly socketService: SocketService
		) {}

	async getPermissionMask(userId: number, channelId: number) {
		try {
			const mask = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId},}, select: {permissionMask:true}});
			return mask.permissionMask;
		} catch (error) {
			console.log(error);
		}
	}

	async getWhoBlockedMe(userId: number) {
		try {
			const blocked = await this.prismaService.blocked.findMany({where: {blockedId: userId}, select: {userId: true}});
			return blocked;
		} catch(error) {
			console.log(error.message);
		}
	}

	async getUserByName(targetName: string) {
		try {
			const user = await this.prismaService.user.findUnique({where: {pseudo: targetName}, select: {id: true, pseudo: true}});
			return user;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async areFriends(userId: number, friendId: number) : Promise<any> {
		try {
			const friends = await this.prismaService.friendship.findUnique({
			where: {
				userId_friendId: {
					userId: userId,
					friendId: friendId
				}
			},
		});
		if (friends == null) {
			return await this.prismaService.friendship.findUnique({
				where: {
					userId_friendId : {
						userId: friendId,
						friendId: userId
				}}
			})
		}
		else
			return friends;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async getUserName(userId: number) : Promise<any> {
		try {
			const name = this.prismaService.user.findUnique({
				where: {id: userId}, 
				select : {pseudo: true}});
			return name;
		} catch (err) {
			throw err
		}
	}

	async removeFriend(userId: number, friendId: number) : Promise<any> {
		try {
			const friendship =  await this.prismaService.friendship.delete({
			where: {
				userId_friendId :{
				userId: userId,
				friendId: friendId
				}}
			});
			return friendship;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async blockUser(userId: number, targetId: number) : Promise<any> {
		try {
			const blocked = await this.prismaService.blocked.upsert({
				where: {
					userId_blockedId: {
					userId: userId,
					blockedId: targetId
					}},
				update: {},
				create: {
					userId: userId,
					blockedId: targetId
				}
			});
			return blocked;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async getUsers() {
		try {
			const user = await this.prismaService.user.findMany({select: {}});
			return user;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async clearUsers() : Promise<any> {
		try {
			await this.prismaService.channelMembership.deleteMany({});
			await this.prismaService.friendship.deleteMany({});
			this.socketService.deleteAllSockets();
			return this.prismaService.user.deleteMany({});
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async updateName(pseudo: string, id: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.update({
				where: {
					id : id
				},
				data : {
					pseudo: pseudo
				}
			});
			return user;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async getUserById(id: number) : Promise<any> {
		try {
			if (id != undefined) {
				const user = await this.prismaService.user.findUnique({
					where: {id : id},
					include : {channelMemberships: true}
				},);
				return user;
			}
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async isUserBlocked(userId: number, targetId: number) : Promise<any> {
		try {
			const blocked = await this.prismaService.blocked.findUnique({
				where: {
					userId_blockedId: {
					userId: userId,
					blockedId: targetId
				}}, select: {
					userId: true,
					blockedId: true
				}
			});
			return blocked;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async blockedByUser(userId: number, targetId: number) : Promise<any> {
		try {
			const blocked = await this.prismaService.blocked.findUnique({
				where: {
					userId_blockedId : {
					userId: targetId,
					blockedId: userId
				}},
			});
			return blocked;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async unBlockUser(userId: number, targetId: number) : Promise<any> {
		try {
			const blocked = await this.prismaService.blocked.delete({where: {
				userId_blockedId: {
					userId: userId,
					blockedId: targetId
				}
			}});
			return blocked;
		} catch (err) {
			throw (new Error(err.message));
		}
	}

	async getMembershipState(userId: number, channelId: number) {
		try {
			const membership = await this.prismaService.channelMembership.findUnique({where: {userId_channelId: {userId: userId, channelId: channelId}}, select: {membershipState: true}});
			return membership.membershipState;
		} catch (err) {
			throw new MyError("Could not find the user whose ID is " + userId);
		}
	}

	async getFriends(userId: number) {
		try {
			return await this.prismaService.friendship.findMany({where: {userId: userId}});
		} catch (err) {throw err}
	}
}
