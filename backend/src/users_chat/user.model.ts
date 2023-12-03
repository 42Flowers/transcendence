import { Socket } from "socket.io";

interface conversations {
	with: User;
	id: string;
}

export class User {

	id: string;
	name: string;
	friends : User[];
	conversations: conversations[];
	socket: Socket;
	
	constructor(
		id:string,
		socket: Socket,
		name: string,
		) {
			this.id = id,
			this.socket = socket;
			this.conversations = [];
		this.name = name,
		this.friends = []
	}
}