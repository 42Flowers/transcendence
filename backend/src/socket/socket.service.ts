import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

interface connectedUsers {
	userId: number,
	sockets: Socket[]
};

@Injectable()
export class SocketService {
	
	constructor(
		private readonly prismaService : PrismaService,
		) {}

	connectedusers : connectedUsers[] = [];

	getSockets(userId: number) : Socket[] {
		this.connectedusers.map((obj) => {
			if (obj.userId === userId) {
				return obj.sockets;
			}
		})
		return []
	}

	addSocket(userId: number, socket: Socket) {
		this.connectedusers.map((obj) => {
			if (obj.userId === userId) {
				obj.sockets.push(socket);
			}
		})
	}

	removeSocket(userId: number, socket: Socket) {
		this.connectedusers.map((obj) => {
			if (obj.userId === userId) {
				obj.sockets.map((sock) => {
					if (sock === socket) 
						obj.sockets.splice(obj.sockets.indexOf(sock), 1);
				})
			}
		})
	}

	deleteAllSockets() {
		this.connectedusers = [];
	}
		
	joinConversation(userId: number, destId: number, convName: string) {
		this.connectedusers.map((user) => {
			if(user.userId === userId ||user.userId === destId) {
				user.sockets.map((sock) => {
					sock.join(convName);
				})
			}
		})
	}

	joinChannel(userId: number, channelName: string) {
		this.connectedusers.map((user) => {
			if (user.userId === userId) {
				user.sockets.map((sock) => {
					sock.join(channelName);
				})
			}
		})
	}

	leaveChannel(userId: number, channelName: string) {
		this.connectedusers.map((user) => {
			if (user.userId === userId) {
				user.sockets.map((sock) => {
					sock.leave(channelName);
				})
			}
		})
	}
}