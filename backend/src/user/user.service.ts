import { Injectable } from "@nestjs/common";

interface userStats {
	level: number,
	rank: string,
	winStreak: number,
	ratio: number,
	winNumber: number,
	looseNumber: number
}

@Injectable()
export class UserService {
	getStats(): userStats {

		let stats: userStats = {
			level: 10,
			rank: "gold",
			winStreak: 16,
			winNumber: 32,
			looseNumber: 4,
			ratio: 16 / 4,
		};
		
		return (stats);
	};
}