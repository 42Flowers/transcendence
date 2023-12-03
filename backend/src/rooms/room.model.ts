import { User } from "../users_chat/user.model";

export class Room {
	id: string;
	name: string;
	admin: User[];
	banned: User[];
	owner: User | undefined;
	users: User[];
	pwdValue: string | undefined;
	inviteOnly: boolean;
	visibility: string;


	constructor(name: string, id : string) {
		this.id = id;
		this.name = name;
		this.banned = [];
		this.users = [];
		this.admin = [];
		this.pwdValue = undefined;
		this.inviteOnly = false;
		this.visibility = 'pivate';
	}
}