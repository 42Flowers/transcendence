/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get } from '@nestjs/common';
import { RoomService } from './rooms.service';

@Controller("room")
export class RoomController {
	constructor(private roomService: RoomService,
				) {}

	@Get("allMessages")
	GetMessages(
		@Body('room') data : {name: string, id: number}
		) {
		const room = this.roomService.getRoom(data.id);
		//Aller chercher dans la database les messages de cette room pour pouvoir les display dans le front
	}

	@Get('allUsers')
	getUsers(
		@Body('room') data: {name: string, id: number}
	) {
		console.log(data.name);
		console.log(this.roomService.getUsersfromRoom(data.id))
		return this.roomService.getUsersfromRoom(data.id);
	}
	

	// @Post("messages")
	// async messages(
	// @Body('username') username : string,
	// @Body('message') message : string
	// ) {
	// return 'test';
	// }
}
