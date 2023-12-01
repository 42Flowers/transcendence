import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from 'src/socket/socket.service';


@Injectable()
export class UsersService {

	constructor(
		private readonly prismaService : PrismaService,
		private readonly socketService: SocketService
		) {}

	async areFriends(userId: number, friendId: number) : Promise<any> {
		try {
			const friends = await this.prismaService.friendship.findUnique({
			where: {
				userId_friendId: {
					userId: userId,
					friendId: friendId
				}
			}
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

	async alreadyRegisterdById(id: number) : Promise<any> {
		try {
			const user = await this.prismaService.user.findUnique({
				where: {
					id: id
				}
			});
			return user;
		}
		catch (err) {
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
					where: {id : id}
				});
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
				}}
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
				}}
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

	async getFriends(userId: number) {
		try {
			return await this.prismaService.friendship.findMany({where: {userId: userId}});
		} catch (err) {throw err}
	}
}
