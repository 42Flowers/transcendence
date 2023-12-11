import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { GameEndedEvent } from "src/events/game-ended.event";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GameHistoryService {
    constructor(private prismaService: PrismaService) {}

    @OnEvent('game.ended', { async: true, promisify: true })
    async handleGameEnded({ game }: GameEndedEvent) {
        const leftPlayerScore = game.getLeftPlayerScore();
        const rightPlayerScore = game.getRightPlayerScore();
        const leftPlayer = game.getLeftPlayerUser();
        const rightPlayer = game.getRightPlayerUser();

        const winnerId = leftPlayerScore < rightPlayerScore ? rightPlayer.id : leftPlayer.id;
        const looserId = leftPlayerScore < rightPlayerScore ? leftPlayer.id : rightPlayer.id;
        
        try {
            const game = await this.prismaService.game.create({
				data: {
					score1: leftPlayerScore,
					score2: rightPlayerScore,
					winnerId: winnerId,
					looserId: looserId,
				}
			});
	
			// Game Participation Pair
			await this.prismaService.gameParticipation.create({
				data: {
					userId: leftPlayer.id,
					opponentId: rightPlayer.id,
					gameId: game.id,
				}
			});

			await this.prismaService.gameParticipation.create({
				data: {
					userId: rightPlayer.id,
					opponentId: leftPlayer.id,
					gameId: game.id,
				}
			});
        } catch {

        }
    }
}