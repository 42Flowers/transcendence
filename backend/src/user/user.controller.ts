import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";

interface userStats {
	level: number,
	rank: string,
	winStreak: number,
	ratio: number,
	winNumber: number,
	looseNumber: number
}

@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('stats')
	getAllStats(): userStats {
		// let stats: userStats;

		// // stats.rank = 3;
		// stats = this.userService.getStats();
		
		return this.userService.getStats();
	}
}


