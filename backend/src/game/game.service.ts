import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { Socket } from 'socket.io';
import { GameEndedEvent } from 'src/events/game-ended.event';
import { GameKeyDownEvent } from 'src/events/game/keyDown.event';
import { GameKeyUpEvent } from 'src/events/game/keyUp.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
import { Game, GameMode, GameState } from './game';
import { User } from '@prisma/client';
import { UserDeclineGameInvitation } from 'src/events/user.decline.invitation.event';

const REFRESH_RATE = 16.66667; // in ms

@Injectable()
export class GameService {
	private randomGameList: Game[];
	private friendsGameList: Game[];

	private readonly inGameUsers: Set<number>;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly socketService: SocketService,
		private readonly eventEmitter: EventEmitter2,
		private readonly socketGateway: SocketGateway) {

		this.randomGameList = [];
		this.friendsGameList = [];
		this.inGameUsers = new Set<number>();
	}

	isUserInGame(userId: number): boolean {
        return this.inGameUsers.has(userId);
    }

	createRandomGame(leftPlayer: User, rightPlayer: User, gameMode: GameMode): Game {
		const game = new Game(this.eventEmitter, leftPlayer, rightPlayer, gameMode);

		this.eventEmitter.emit('game.joined', leftPlayer.id);
		this.eventEmitter.emit('game.joined', rightPlayer.id);

		this.inGameUsers.add(leftPlayer.id);
		this.inGameUsers.add(rightPlayer.id);

		this.randomGameList.push(game);
		return game;
	}

	createInviteGame(leftPlayer: User, rightPlayer: User, gameMode: GameMode): Game {
		const game = new Game(this.eventEmitter, leftPlayer, rightPlayer, gameMode);

		this.eventEmitter.emit('game.joined', leftPlayer.id);
		this.eventEmitter.emit('game.joined', rightPlayer.id);

		this.inGameUsers.add(leftPlayer.id);
		this.inGameUsers.add(rightPlayer.id);

		this.friendsGameList.push(game);
		return game;
	}

	findInvitedGame(userId: number): Game | null {
		for (let i = 0; i < this.friendsGameList.length; ++i) {
			const currGame = this.friendsGameList[i];

			if (userId == currGame.getRightPlayerUser().id) {
				return currGame;
			}
		}
		return null;
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

	@OnEvent('user.decline.invitation')
	handleUserDeclineInvitation({ socket }: UserDeclineGameInvitation) {
		const { id } = socket.user;

		if (!this.isUserInGame(id))
			return ;

		const game = this.findInvitedGame(id);

		if (game && game.getGameState() === GameState.Waiting) {
			this.deleteGame(game);
		}
	}

	deleteGame(game: Game) {
		let gameFound = false;

		for (let i = 0; i < this.friendsGameList.length; ++i) {
			if (this.friendsGameList[i] === game) {
				console.log('Friend game found', i);
				this.friendsGameList.splice(i, 1);
				gameFound = true;
				break ;
			}
		}

		if (!gameFound) {
			for (let i = 0; i < this.randomGameList.length; ++i) {
				if (this.randomGameList[i] === game) {
					console.log('Random game found', i);
					this.randomGameList.splice(i, 1);
					gameFound = true;
					break ;
				}
			}
		}

		if (!gameFound)
			return ;
	
		this.inGameUsers.delete(game.getLeftPlayerUser().id);
		this.inGameUsers.delete(game.getRightPlayerUser().id);

		this.eventEmitter.emit('game.leaved', game.getLeftPlayerUser().id);
		this.eventEmitter.emit('game.leaved', game.getRightPlayerUser().id);
	}

	@OnEvent('game.ended')
	handleGameEnded({ game }: GameEndedEvent) {
		console.log('Game ended');
		this.deleteGame(game);
	}
}
