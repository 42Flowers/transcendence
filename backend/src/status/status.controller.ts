import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { Request as ExpressRequest } from 'express';
import { SocketService } from "src/socket/socket.service";

@Controller({
	path: 'gateway',
})
@UseGuards(AuthGuard)
export class StatusController {
	constructor(private readonly socketService: SocketService) {}

	@Get('/status')
	async getFriendsStatus(
		@Request() req: ExpressRequest
	) {
		const { id: userId } = req.user;
		const statuses = await this.socketService.getUserStatus(userId);

		return statuses;
	}
}
