import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Socket } from 'socket.io';
import { SocketConnectedEvent } from 'src/events/socket-connected.event';
import { SocketDisconnectedEvent } from 'src/events/socket-disconnected.event';
import { PrismaService } from 'src/prisma/prisma.service';

type ConnectedUsers = {
	[k: number]: Socket[];
};

@Injectable()
export class SocketService {
	
	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2
		) {}

	private connectedUsers : ConnectedUsers = {};
	private usersInGame = new Set<number>();

	isUserInGame(userId: number) {
		return this.usersInGame.has(userId);
	}
	
	@OnEvent('game.joined')
	handleGameJoined(userId: number) {
		this.usersInGame.add(userId);
	}

	@OnEvent('game.leaved')
	handleGameLeaved(userId: number) {
		this.usersInGame.delete(userId);
	}

	getSockets(userId: number): Socket[] {
		if (userId in this.connectedUsers) {
			return this.connectedUsers[userId];
		}
		return [];
	}

	isOnline(userId: number): boolean {
		return this.getSockets(userId).length > 0;
	}

	emitToUserSockets(userId: number, ev: string, ...args: any[]) {
		this.foreachUserSocket(userId, client => client.emit(ev, ...args));
	}

	addSocket(socket: Socket) {
		const userId = Number(socket.user!.sub);

		if (!(userId in this.connectedUsers)) {
			this.connectedUsers[userId] = [];
		}

		this.connectedUsers[userId].push(socket);
	
		this.eventEmitter.emit('socket.connected', new SocketConnectedEvent(socket));
	}

	removeSocket(socket: Socket) {
		const userId = Number(socket.user!.sub);

		if (userId in this.connectedUsers) {
			const clientList = this.connectedUsers[userId];
			const idx = clientList.findIndex(e => e === socket);
			if (idx >= 0) {
				clientList.splice(idx, 1);
			}

			if (0 === clientList.length) {
				delete this.connectedUsers[userId];
			}
		}

		this.eventEmitter.emit('socket.disconnected', new SocketDisconnectedEvent(socket));
	}

	deleteAllSockets() {
		this.connectedUsers = [];
	}

	foreachUserSocket(userId: number, fn: (socket: Socket) => void) {
		if (userId in this.connectedUsers) {
			this.connectedUsers[userId].forEach(fn);
		}
	}

	joinConversation(userId: number, destId: number, convName: string) {
		/* Make userId join convName */
		this.foreachUserSocket(userId, client => client.join(convName));

		/* Make destId join convName */
		this.foreachUserSocket(destId, client => client.join(convName));
	}

	joinChannel(userId: number, channelName: string) {
		this.foreachUserSocket(userId, client => client.join(channelName));
	}

	leaveChannel(userId: number, channelName: string) {
		this.foreachUserSocket(userId, client => client.leave(channelName));
	}

	async getUserStatus(userId: number) {
		try {
			const users = await this.prismaService.user.findMany({
				where: {
					id: {
						not: userId,
					},
				},
				select: {
					id: true,
					pseudo: true,
				},
			});

			return users.map(({ id, pseudo }) => {
				if (this.isUserInGame(id))
					return [id, pseudo, 'ingame'];
				if (id in this.connectedUsers)
					return [id, pseudo,'online'];
				return [id, pseudo, 'offline'];
			});
		} catch {
			throw new ForbiddenException();
		}
	}
}
