import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { Socket } from 'socket.io';
import { GameEndedEvent } from 'src/events/game-ended.event';
import { GameKeyDownEvent } from 'src/events/game/keyDown.event';
import { GameKeyUpEvent } from 'src/events/game/keyUp.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { Game, GameMode } from './game';

const REFRESH_RATE = 16.66667; // in ms

@Injectable()
export class GameService {
	randomGameList: Game[];
	friendsGameList: Game[];

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly socketGateway: SocketGateway) {

		this.randomGameList = [];
		this.friendsGameList = [];
	}

	createGame(leftPlayer: Socket, rightPlayer: Socket, gameMode: GameMode): Game {
		const game = new Game(this.eventEmitter, leftPlayer, rightPlayer, gameMode);
		game.start();

		this.randomGameList.push(game);
		return game;
	}

	isUserInGame(socket: Socket): boolean {
        return false;
    }

	@Interval(REFRESH_RATE)
	tick() {
		this.randomGameList.forEach(game => game.tick());
		this.friendsGameList.forEach(game => game.tick());
	}

	@OnEvent('game.keyUp')
	handleKeyUp({ socket, key }: GameKeyUpEvent) {
		const { game } = socket;

		if (game) {
			game.handleKey(socket, key, false);
		}
	}

	@OnEvent('game.keyDown')
	handleKeyDown({ socket, key }: GameKeyDownEvent) {
		const { game } = socket;

		if (game) {
			game.handleKey(socket, key, true);
		}
	}

	@OnEvent('game.ended')
	handleGameEnded({ game }: GameEndedEvent) {
		console.log('Game ended');

		/** TODO remove the game from the list */
	}
}
