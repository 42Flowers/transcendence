import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { Socket } from 'socket.io';
import { GameEndedEvent } from 'src/events/game-ended.event';
import { GameInviteToNormal } from 'src/events/game/inviteToNormalGame.event';
import { GameInviteToSpecial } from 'src/events/game/inviteToSpecialGame.event';
import { GameJoinInvite } from 'src/events/game/joinInvite.event';
import { GameJoinRandomEvent } from 'src/events/game/joinRandom.event';
import { GameKeyDownEvent } from 'src/events/game/keyDown.event';
import { GameKeyUpEvent } from 'src/events/game/keyUp.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameMode } from './game';

const REFRESH_RATE = 16.66667; // in ms

@Injectable()
export class GameService {
	private randomGameList: Game[];
	private friendsGameList: Game[];

	private readonly inGameUsers: Set<number>;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly socketGateway: SocketGateway) {

		this.randomGameList = [];
		this.friendsGameList = [];
		this.inGameUsers = new Set<number>();
	}

	createGame(leftPlayer: Socket, rightPlayer: Socket, gameMode: GameMode): Game {
		const game = new Game(this.eventEmitter, leftPlayer, rightPlayer, gameMode);
		game.start();

		this.inGameUsers.add(leftPlayer.user.id);
		this.inGameUsers.add(rightPlayer.user.id);

		this.randomGameList.push(game);

		return game;
	}
	@OnEvent('game.joinInvite')
	handleJoinInvite(event: GameJoinInvite) {
		this.joinInviteGame(event.socket);
	}

	@OnEvent('game.inviteToNormal')
	handleInviteToNormal(event: GameInviteToNormal) {
		this.createInviteGame(event.socket, event.targetId, NORMAL_MODE);
	}

	@OnEvent('game.inviteToSpecial')
	handleInviteToSpecial(event: GameInviteToSpecial) {
		this.createInviteGame(event.socket, event.targetId, SPECIAL_MODE);
	}

	@OnEvent('game.joinRandom')
	handleJoinRandomGame(event: GameJoinRandomEvent) {
		this.joinRandomGame(event.socket, event.gameMode);
	}

	isUserInGame(socket: Socket): boolean {
        return this.inGameUsers.has(socket.user.id);
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

	async checkBlockedUser(userAId, userBId) {
		const userAToB = await this.prismaService.blocked.findUnique({
			where: {
				userId_blockedId: {
					userId: userAId,
					blockedId: userBId,
				}
			}
		});

		const userBToA = await this.prismaService.blocked.findUnique({
			where: {
				userId_blockedId: {
					userId: userBId,
					blockedId: userAId,
				}
			}
		});

		console.log(userAToB, "    ", userBToA);

		if (userAToB || userBToA) {
			return true;
		}
		else {
			return false;
		}
	}

	async createInviteGame(socket: Socket, targetId: number, gameMode: number) {
		if (this.isUserInGame(Number(socket.user.sub)) || this.isUserInGame(targetId))
			return;

		if (await this.checkBlockedUser(Number(socket.user.sub), targetId)) {
			return ;
		}

		const roomName: string = uuidv4();
		const userData = await this.prismaService.user.findUnique({
			where: {
				id: Number(socket.user.sub),
			},
			select: {
				pseudo: true,
			}
		});

		this.eventEmitter.emit('game.joined',  Number(socket.user.sub));
		this.eventEmitter.emit('game.joined',  Number(targetId));
		socket.join(roomName);
		this.friendsGameList.push({
			roomName: roomName,
			isFull: false,
			isRunning: false,
			startTime: null,
			countdown: 3,
			userIdLeft: Number(socket.user.sub),
			userIdRight: targetId,
			socketLeft: socket,
			socketRight: null,
			mode: gameMode,
			state: {
				leftPad: {
					x: 5,
					y: Math.round(BOARD_HEIGHT / 2) - Math.round(BOARD_WIDTH / 20),
					width: 10,
					length: Math.round(BOARD_WIDTH / 10),
					activate: SHIELD_NOT_ACTIVATED,
				},
				rightPad: {
					x: BOARD_WIDTH - 5 - 10,
					y: Math.round(BOARD_HEIGHT / 2) - Math.round(BOARD_WIDTH / 20),
					width: 10,
					length: Math.round(BOARD_WIDTH / 10),
					activate: SHIELD_NOT_ACTIVATED,
				},
				ball: {
					speed: {x: 1, y: 1},
					speedModifyer: BALL_SPEED_MOD,
					x: Math.round(BOARD_WIDTH / 2),
					y: Math.round(BOARD_HEIGHT / 2),
					radius: BALL_RADIUS,
				},
				score: {
					leftPlayer: 0,
					rightPlayer: 0,
				},
				keys: {
					leftPadArrowUp: false,
					leftPadArrowDown: false,
					leftPadSpacebar: false,
					rightPadArrowUp: false,
					rightPadArrowDown: false,
					rightPadSpacebar: false,
				}
			}

		});
		this.socketService.emitToUserSockets(targetId, 'showGameInvite', userData.pseudo);
	}

	joinInviteGame(socket: Socket) {
		for (let i = 0; i < this.friendsGameList.length; ++i) {
			const currGame = this.friendsGameList[i];

			if (Number(socket.user.sub) == currGame.userIdRight) {
				currGame.socketRight = socket;
				socket.join(currGame.roomName);
				currGame.isFull = true;
				currGame.isRunning = false;
				return ;
			}
		}
	}

	@OnEvent('game.ended')
	handleGameEnded({ game }: GameEndedEvent) {
		console.log('Game ended');

		this.inGameUsers.delete(game.getLeftPlayerUser().id);
		this.inGameUsers.delete(game.getRightPlayerUser().id);
		/** TODO remove the game from the list */
	}
}
