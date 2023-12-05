import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

type ConnectedUsers = {
	[k: number]: Socket[];
};

@Injectable()
export class SocketService {
	
	constructor(
		private readonly prismaService : PrismaService,
		) {}

	private connectedUsers : ConnectedUsers = {};

	getSockets(userId: number): Socket[] {
		if (userId in this.connectedUsers) {
			return this.connectedUsers[userId];
		}
		return [];
	}

	emitToUserSockets(userId: number, ev: string, ...args: any[]) {
		console.log(this.connectedUsers[userId].length, "sockets");
		this.foreachUserSocket(userId, client => client.emit(ev, ...args));
	}

	addSocket(socket: Socket) {
		const userId = Number(socket.user!.sub);

		if (!(userId in this.connectedUsers)) {
			this.connectedUsers[userId] = [];
		}

		this.connectedUsers[userId].push(socket);
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
}