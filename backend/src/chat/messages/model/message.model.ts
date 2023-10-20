import { User } from "../../users/model/user.model";

export class Message {
	id: string;
	content: string;
	createdAt: number;
	authorId: string;
	author: User;


	constructor(id : string) {
		this.id = id;
		const date = new Date();
		this.createdAt = date.getTime(); // mais le moment de l'envoi il va plutot falloir le récupérer du front non ? 
	}
}