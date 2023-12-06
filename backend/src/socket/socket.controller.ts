import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { SocketService } from "./socket.service";
import { Request as ExpressRequest } from 'express';

@Controller({
	path: 'gateway'
})
@UseGuards(AuthGuard)
export class SocketController {
	constructor(private readonly socketService: SocketService) {}

	@Get('/status')
	async getFriendsStatus(
		@Request() req: ExpressRequest
	) {
		const userId = Number(req.user.sub);
		const statuses = await this.socketService.getUserStatus(userId);
		console.log(statuses);

		return statuses;
	}
}
