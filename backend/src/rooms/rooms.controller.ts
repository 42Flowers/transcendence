/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, ParseIntPipe, Request } from '@nestjs/common';
import { RoomService } from './DBrooms.service';
import { Request as ExpressRequest } from 'express';

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

	@Get(':id/users')
	async getRoomUsers(
		@Request() req: ExpressRequest,
		@Param('id', ParseIntPipe) id: number) {
			/* TODO put the real user id here */
		const userId = 1; //Number(req.user.sub);
		return await this.roomService.getChannelUsers(userId, id);
	}
	

	// @Post("messages")
	// async messages(
	// @Body('username') username : string,
	// @Body('message') message : string
	// ) {
	// return 'test';
	// }
}
