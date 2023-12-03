import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './DBusers.service';

@Controller("users")
export class UserController {

	userService: UsersService;

	@Get('allUsers')
	getAllUsers() {
		return this.userService.getUsers();
	}

	

	
	@Post("messages")
	async messages(
	@Body('username') username : string,
	@Body('message') message : string
	) {
		return 'test';
	}
}
