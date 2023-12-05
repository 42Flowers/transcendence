import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Socket } from 'socket.io';
import { GameCancelSearchEvent } from 'src/events/game/cancelSearch.event';
import { GameJoinRandomEvent } from 'src/events/game/joinRandom.event';
import { GameKeyDownEvent } from 'src/events/game/keyDown.event';
import { GameKeyUpEvent } from 'src/events/game/keyUp.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { v4 as uuidv4 } from 'uuid';

const SOCKET_NOT_FOUND = -1;
const REFRESH_RATE = 16.66667; // in ms

const BOARD_WIDTH = 800; // in px
const BOARD_HEIGHT = 600; // in px
const BALL_RADIUS = 15; // in px

const GAME_MAX_GOAL = 2;
const GAME_START_DELAY = 3200;

const PADDLE_SPEED = 6;
const BALL_SPEED_Y = 5;
const BALL_SPEED_X = 1;
const BALL_SPEED_MOD = 2;

const NORMAL_MODE = 0;
const SPECIAL_MODE = 1;

const LEFT = 0;
const RIGHT = 1;
const SHIELD_NOT_ACTIVATED = -1;
let TURN = LEFT;
const SPEED_THRESHOLD = 4;
const SHIELD_MAX_INTERVAL = 400; // in ms

interface scoreElem {
	leftPlayer: number,
	rightPlayer: number,
}

interface paddleElem {
	x: number,
	y: number,
	width: number,
	length: number,
	activate?: number
}

interface ballElem {
	speed: {x: number, y: number},
	speedModifyer: number,
	x: number,
	y: number,
	radius: number,
}

interface keyStateElem {
	leftPadArrowUp: boolean;
	leftPadArrowDown: boolean;
	leftPadSpacebar?: boolean;

	rightPadArrowUp: boolean;
	rightPadArrowDown: boolean;
	rightPadSpacebar?: boolean;
}

interface gameState {
	leftPad: paddleElem,
	rightPad: paddleElem,
	ball: ballElem,
	score: scoreElem,
	keys: keyStateElem,
}

interface gameParam {
	roomName: string,
	isFull: boolean,
	isRunning: boolean,
	startTime: number | null,
	countdown: number,
	userIdLeft: number | null,
	userIdRight: number | null,
	socketLeft: Socket | null,
	socketRight: Socket | null,
	mode: number,
	state: gameState,
};

@Injectable()
export class GameService {

	randomGameList: gameParam[];
	friendsGameList: gameParam[];

	constructor(
		private readonly prisma: PrismaService,
		private socketGateway: SocketGateway) {
			this.randomGameList = [];
			this.friendsGameList = [];
			this.tick();
	}

	// EVENT LISTENERS

	@OnEvent('game.joinRandom')
	handleJoinRandomGame(event: GameJoinRandomEvent) {
		this.joinRandomGame(event.socket, event.gameMode);
	}

	@OnEvent('game.cancelSearch')
	handleCancelSearch(event: GameCancelSearchEvent) {
		this.removeFromGame(event.socket);
	}

	@OnEvent('game.keyUp')
	handleKeyUp(event: GameKeyUpEvent) {
		this.keyUp(event.socket, event.key);
	}

	@OnEvent('game.keyDown')
	handleKeyDown(event: GameKeyDownEvent) {
		this.keyDown(event.socket, event.key);
	}

	// GAMES SUPERVISOR

	tick() {
		const interval = setInterval(() => {
			if (this.randomGameList.length > 0)
				this.updateRandomGames();
			if (this.friendsGameList.length > 0)
				this.updateFriendsGames();
		}, REFRESH_RATE);
	}


	joinRandomGame(socket: Socket, gameMode: number) {
		if (this.isUserInGame(socket))
			return;  // EXCEPTION ???

		for (let i = 0; i < this.randomGameList.length; ++i) {
			const currGame = this.randomGameList[i];

			if (currGame.mode !== gameMode)
				continue;
			if (currGame.isRunning == false && currGame.isFull == false) {
				if (!currGame.socketLeft) {
					currGame.socketLeft = socket;
					currGame.userIdLeft = Number(socket.user.sub);
				}
				else {
					currGame.socketRight = socket;
					currGame.userIdRight = Number(socket.user.sub);
				}
				socket.join(currGame.roomName);
				currGame.isFull = true;
				currGame.isRunning = false;
				return ;
			}
		}
		const roomName: string = uuidv4();

		socket.join(roomName);
		this.randomGameList.push({
			roomName: roomName,
			isFull: false,
			isRunning: false,
			startTime: null,
			countdown: 3,
			userIdLeft: Number(socket.user.sub),
			userIdRight: null,
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
	}

	removeFromGame(socket: Socket) {
		for (let i = 0; i < this.randomGameList.length; ++i) {
			const currGame = this.randomGameList[i];

			if (currGame.isRunning)
				continue;

			if (currGame.socketLeft && currGame.socketLeft.id === socket.id) {
				currGame.socketLeft.leave(currGame.roomName);
				currGame.socketLeft = null;
				currGame.isFull = false;
				currGame.userIdLeft = null;
			}
			else if (currGame.socketRight && currGame.socketRight.id === socket.id) {
				currGame.socketRight.leave(currGame.roomName);
				currGame.socketRight = null;
				currGame.isFull = false;
				currGame.userIdRight = null;
			}

			if (!currGame.socketLeft && !currGame.socketRight)
				this.randomGameList.splice(i, 1);
		}
		for (let i = 0; i < this.friendsGameList.length; ++i) {
			const currGame = this.friendsGameList[i];

			if (currGame.isRunning)
				continue;

			if (currGame.socketLeft && currGame.socketLeft.id === socket.id) {
				currGame.socketLeft.leave(currGame.roomName);
				currGame.socketLeft = null;
				currGame.isFull = false;
				currGame.userIdLeft = null;
			}
			else if (currGame.socketRight && currGame.socketRight.id === socket.id) {
				currGame.socketRight.leave(currGame.roomName);
				currGame.socketRight = null;
				currGame.isFull = false;
				currGame.userIdRight = null;
			}

			if (!currGame.socketLeft && !currGame.socketRight)
				this.randomGameList.splice(i, 1);
		}
	}

	keyUp(socket: Socket, key: string) {
		let gameIndex = this.findFriendsGameBySocket(socket.id);

		if (gameIndex !== -1 && this.friendsGameList[gameIndex].isRunning)
			this.updateKeysUp(this.friendsGameList[gameIndex], socket.id, key);
		else {
			gameIndex = this.findRandomGameBySocket(socket.id);
			if (gameIndex !== -1 && this.randomGameList[gameIndex].isRunning)
				this.updateKeysUp(this.randomGameList[gameIndex], socket.id,  key);
			else
				return; // Excepticion not inside a game
		}
	}
	
	keyDown(socket: Socket, key: string) {
		let gameIndex = this.findFriendsGameBySocket(socket.id);
	
		if (gameIndex !== -1 && this.friendsGameList[gameIndex].isRunning)
			this.updateKeysDown(this.friendsGameList[gameIndex], socket.id, key);
		else {
			gameIndex = this.findRandomGameBySocket(socket.id);
			if (gameIndex !== -1 && this.randomGameList[gameIndex].isRunning)
				this.updateKeysDown(this.randomGameList[gameIndex], socket.id, key);
			else
				return; // Excepticion not inside a game
		}
	}

	// UPDATE GAME STATE

	updateKeysUp(currGame: gameParam, socketId: string, key: string) {
		const keys = currGame.state.keys;

		if (socketId === currGame.socketLeft.id) {
			if (key === "ArrowUp") {
				keys.leftPadArrowUp = false;
			}
			else if (key === "ArrowDown") {
				keys.leftPadArrowDown = false;
			}
			else if (key === " ") {
				keys.leftPadSpacebar = false;
			}
		}
		else if (socketId === currGame.socketRight.id) {
			if (key === "ArrowUp") {
				keys.rightPadArrowUp = false;
			}
			else if (key === "ArrowDown") {
				keys.rightPadArrowDown = false;
			}
			else if (key === " ") {
				keys.rightPadSpacebar = false;
			}
		}
	}

	updateKeysDown(currGame: gameParam, socketId: string, key: string) {
		const keys = currGame.state.keys;

		if (socketId === currGame.socketLeft.id) {
			if (key === "ArrowUp") {
				keys.leftPadArrowUp = true;
			}
			else if (key === "ArrowDown") {
				keys.leftPadArrowDown = true;
			}
			else if (key === " ") {
				keys.leftPadSpacebar = true;
				if (currGame.state.leftPad.activate == SHIELD_NOT_ACTIVATED && TURN == LEFT) {
					currGame.state.leftPad.activate = new Date().getTime();
				}
			}
		}
		else if (socketId === currGame.socketRight.id) {
			if (key === "ArrowUp") {
				keys.rightPadArrowUp = true;
			}
			else if (key === "ArrowDown") {
				keys.rightPadArrowDown = true;
			}
			else if (key === " ") {
				keys.rightPadSpacebar = true;
				if (currGame.state.rightPad.activate == SHIELD_NOT_ACTIVATED && TURN == RIGHT) {
					currGame.state.rightPad.activate = new Date().getTime();
				}
			}
		}
	}

	async sendPlayersData(currGame: gameParam) {
		const playerData = await this.getPlayersData(currGame.userIdLeft, currGame.userIdRight);

		this.socketGateway.server
			.to(currGame.roomName)
			.emit("playerData", playerData);
	}

	updateRandomGames() {
		for (let i = 0; i < this.randomGameList.length; ++i) {
			const currGame = this.randomGameList[i];
			const state = currGame.state;

			if (!currGame.isRunning && currGame.isFull) {
				if (!currGame.startTime && currGame.mode === NORMAL_MODE) {
					this.sendPlayersData(currGame);
					this.socketGateway.server
					.to(currGame.roomName)
					.emit("launchRandomNormal");
					currGame.startTime = new Date().getTime();
				}
				else if (!currGame.startTime && currGame.mode === SPECIAL_MODE) {
					this.sendPlayersData(currGame);
					this.socketGateway.server
					.to(currGame.roomName)
					.emit("launchRandomSpecial");
					currGame.startTime = new Date().getTime();
				}
				this.updateFrontCountdown(currGame);
				if (new Date().getTime() - currGame.startTime > GAME_START_DELAY) {
					currGame.isRunning = true;
					this.resetGamePosition(currGame);
				}
			}

			if (!currGame.isRunning)
				continue;

			if (this.checkGameFinished(currGame)) {
				currGame.socketLeft.leave(currGame.roomName);
				currGame.socketRight.leave(currGame.roomName);
				this.randomGameList.splice(i, 1)
				return;
			}

			this.checkGoal(currGame, i);
			this.movePaddles(currGame);
			this.moveBall(currGame);
			this.socketGateway.server
				.to(currGame.roomName)
				.emit("updateGame", state.leftPad, state.rightPad, state.ball);
		}
	}
	
	
	updateFriendsGames() {
		for (let i = 0; i < this.friendsGameList.length; ++i) {
			const currGame = this.friendsGameList[i];
			const state = currGame.state;

			if (!currGame.isRunning && currGame.isFull) {
				if (!currGame.startTime && currGame.mode === NORMAL_MODE) {
					this.sendPlayersData(currGame);				
					this.socketGateway.server
					.to(currGame.roomName)
					.emit("launchRandomNormal");
					currGame.startTime = new Date().getTime();
				}
				else if (!currGame.startTime && currGame.mode === SPECIAL_MODE) {
					this.sendPlayersData(currGame);
					this.socketGateway.server
					.to(currGame.roomName)
					.emit("launchRandomSpecial");
					currGame.startTime = new Date().getTime();
				}
				this.updateFrontCountdown(currGame);
				if (new Date().getTime() - currGame.startTime > GAME_START_DELAY) {
					currGame.isRunning = true;
					this.resetGamePosition(currGame);
				}
			}

			if (!currGame.isRunning)
				continue;

			if (this.checkGameFinished(currGame)) {
				currGame.socketLeft.leave(currGame.roomName);
				currGame.socketRight.leave(currGame.roomName);
				this.randomGameList.splice(i, 1)
				return;
			}
	
			this.checkGoal(currGame, i);
			this.movePaddles(currGame);
			this.moveBall(currGame);
			this.socketGateway.server
				.to(currGame.roomName)
				.emit("updateGame", state.leftPad, state.rightPad, state.ball);
		}
	}

	resetGamePosition(currGame: gameParam) {
		const state = currGame.state;

		state.ball.speed.y = 0;
		while (Math.abs(state.ball.speed.y) <= 0.2 || Math.abs(state.ball.speed.y) >= 0.8) {
			const heading = Math.random() * (2 * Math.PI);
			const x_dir = Math.random() >= 0.5 ? 1 : -1;
			state.ball.speed = { x: BALL_SPEED_X * x_dir, y: Math.sin(heading) }
		}

		state.ball.speedModifyer = BALL_SPEED_MOD;
		state.ball.x = Math.round(BOARD_WIDTH / 2);
		state.ball.y = Math.round(BOARD_HEIGHT / 2);

		state.leftPad.y = Math.round(BOARD_HEIGHT / 2) - Math.round(state.leftPad.length / 2);
		state.rightPad.y = Math.round(BOARD_HEIGHT / 2) - Math.round(state.rightPad.length / 2);

		this.socketGateway.server
			.to(currGame.roomName)
			.emit("updateGame", state.leftPad, state.rightPad, state.ball);
	}

	movePaddles(currGame: gameParam) {
		const state = currGame.state;
		const keys = currGame.state.keys;

		if (keys.leftPadArrowUp) {
			state.leftPad.y -= PADDLE_SPEED;
		}
		if (keys.leftPadArrowDown) {
			state.leftPad.y += PADDLE_SPEED;
		}
		state.leftPad.y = Math.max(0, state.leftPad.y);
		state.leftPad.y = Math.min(BOARD_HEIGHT - state.leftPad.length, state.leftPad.y);
		
		// RIGHT PLAYER MOVEMENT
		if (keys.rightPadArrowUp) {
			state.rightPad.y -= PADDLE_SPEED;
		}
		if (keys.rightPadArrowDown) {
			state.rightPad.y += PADDLE_SPEED;
		}
		state.rightPad.y = Math.max(0, state.rightPad.y);
		state.rightPad.y = Math.min(BOARD_HEIGHT - state.rightPad.length, state.rightPad.y);
	}

	moveBall(currGame: gameParam) {
		const state = currGame.state;
		const server = this.socketGateway.server;

		function checkWallCollision(ball: ballElem) {
			if (ball.y - ball.radius <= 0 && ball.speed.y < 0
				|| ball.y + ball.radius >= BOARD_HEIGHT && ball.speed.y > 0)
				ball.speed.y *= -1;
		}

		function checkPaddleCollision(ball: ballElem, leftPad: paddleElem, rightPad: paddleElem) {
			function leftPaddleCollision(): boolean {
				if (ball.x - ball.radius <= leftPad.x + leftPad.width
					&& ball.y + ball.radius >= leftPad.y
					&& ball.y - ball.radius <= leftPad.y + leftPad.length)
				{
					return true;
				}
				return false;
			}
	
			function rightPaddleCollision(): boolean {
				if (ball.x + ball.radius >= rightPad.x
					&& ball.y + ball.radius >= rightPad.y
					&& ball.y - ball.radius <= rightPad.y + rightPad.length)
				{
						return true;
				}
				return false;
			}
	
			if (leftPaddleCollision() && ball.speed.x < 0) {
				const relativeBallPos = ball.y - (leftPad.y + leftPad.length / 2);
				const currTime = new Date().getTime();

				if (currGame.mode == SPECIAL_MODE && Math.abs(new Date().getTime() - leftPad.activate) < SHIELD_MAX_INTERVAL) {
					server.to(currGame.roomName).emit("shield", "left");
					ball.speedModifyer += 0.2;
					ball.speed.x *= -1;
					ball.speed.y = ball.speed.x * BALL_SPEED_Y * (relativeBallPos / leftPad.length / 2);
				}
				else if (currGame.mode == SPECIAL_MODE && ball.speedModifyer > 3 && Math.abs(currTime - rightPad.activate) >= 400) {
					// destroy paddle
				}
				else {
					ball.speed.x *= -1;
					ball.speed.y = ball.speed.x * BALL_SPEED_Y * (relativeBallPos / leftPad.length / 2);
				}
				leftPad.activate = SHIELD_NOT_ACTIVATED;
				TURN = RIGHT;
			}
			if (rightPaddleCollision() && ball.speed.x > 0) {
				const relativeBallPos = ball.y - (rightPad.y + rightPad.length / 2);
				const currTime = new Date().getTime();

				if (currGame.mode == SPECIAL_MODE && Math.abs(currTime - rightPad.activate) < SHIELD_MAX_INTERVAL) {
					server.to(currGame.roomName).emit("shield", "right");
					ball.speedModifyer += 0.2;
					ball.speed.x *= -1;
					ball.speed.y = ball.speed.x * (BALL_SPEED_Y * -1) * (relativeBallPos / rightPad.length / 2);
				}
				else if (currGame.mode == SPECIAL_MODE && ball.speedModifyer > SPEED_THRESHOLD && Math.abs(currTime - rightPad.activate) >= 400) {
					// destroy paddle
				}
				else {
					ball.speed.x *= -1;
					ball.speed.y = ball.speed.x * (BALL_SPEED_Y * -1) * (relativeBallPos / rightPad.length / 2);
				}
				rightPad.activate = SHIELD_NOT_ACTIVATED;
				TURN = LEFT;
			}

		}

		checkWallCollision(state.ball);
		checkPaddleCollision(state.ball, state.leftPad, state.rightPad);
		state.ball.x += state.ball.speed.x * state.ball.speedModifyer;
		state.ball.y += state.ball.speed.y * state.ball.speedModifyer;
	}

	// Game State UTILS

	checkGoal(currGame: gameParam, gameIndex: number) {
		const state = currGame.state;

		if (state.ball.x <= 0) {
			state.score.rightPlayer++;
			this.socketGateway.server.to(currGame.roomName).emit("updateScore", state.score);
			this.resetGamePosition(currGame);
		}
		else if (state.ball.x >= BOARD_WIDTH) {
			state.score.leftPlayer++;
			this.socketGateway.server.to(currGame.roomName).emit("updateScore", state.score);
			this.resetGamePosition(currGame);
		}
	}

	checkGameFinished(currGame: gameParam) {
		const state = currGame.state;

		if (state.score.leftPlayer >= GAME_MAX_GOAL || state.score.rightPlayer >= GAME_MAX_GOAL) {
			this.updateGameHistory(currGame);
			this.socketGateway.server
				.to(currGame.roomName)
				.emit("gameFinished");
			return true;
		}
		else
			return false;
	}

	// UTILS

	async updateGameHistory(currGame: gameParam) {
		const score = currGame.state.score;
		const winnerId = score.leftPlayer > score.rightPlayer ? currGame.userIdLeft : currGame.userIdRight;
		const looserId = score.leftPlayer < score.rightPlayer ? currGame.userIdLeft : currGame.userIdRight;

		// I DONT KNOW WAT TO DO !
		try {
			const game = await this.prisma.game.create({
				data: {
					score1: currGame.state.score.leftPlayer,
					score2: currGame.state.score.rightPlayer,
					winnerId: winnerId,
					looserId: looserId,
				}
			});
	
			// Game Participation Pair
			await this.prisma.gameParticipation.create({
				data: {
					userId: currGame.userIdLeft,
					opponentId: currGame.userIdRight,
					gameId: game.id,
				}
			})
			await this.prisma.gameParticipation.create({
				data: {
					userId: currGame.userIdRight,
					opponentId: currGame.userIdLeft,
					gameId: game.id,
				}
			})
		} catch (e) {
			return e;
		}
	}

	async getPlayersData(userLeftId: number, userRightId: number) {

		try {
			const leftUserData = await this.prisma.user.findUnique({
				where: {
					id: userLeftId,
				},
				select: {
					pseudo: true,
					avatar:true,
				}
			});
			const rightUserData = await this.prisma.user.findUnique({
				where: {
					id: userRightId,
				},
				select: {
					pseudo: true,
					avatar:true,
				}
			});
	
			const data = {
				left: leftUserData,
				right: rightUserData,
			}
			return data;
		} catch (e) {
			return e;
		}
	}

	isUserInGame(socket: Socket) {
		for (let i = 0; i < this.randomGameList.length; ++i) {
			const currGame = this.randomGameList[i];

			if ((currGame.userIdLeft && Number(socket.user.sub) == currGame.userIdLeft)
					|| (currGame.userIdRight && Number(socket.user.sub) == currGame.userIdRight))
				return true;
		}
		for (let i = 0; i < this.friendsGameList.length; ++i) {
			const currGame = this.friendsGameList[i];

			if ((currGame.userIdLeft && Number(socket.user.sub) == currGame.userIdLeft)
					|| (currGame.userIdRight && Number(socket.user.sub) == currGame.userIdRight))
				return true;
		}

		return false;
	}

	findRandomGameBySocket(socketId: string) {
		for (let i = 0; i < this.randomGameList.length; i++) {
			const currGame = this.randomGameList[i];
			if (currGame.socketLeft.id === socketId || currGame.socketRight.id === socketId)
				return i;
		}
		return SOCKET_NOT_FOUND;
	}

	findFriendsGameBySocket(socketId: string) {
		for (let i = 0; i < this.friendsGameList.length; i++) {
			const currGame = this.friendsGameList[i];
			if (currGame.socketLeft.id === socketId || currGame.socketRight.id === socketId)
				return i;
		}
		return SOCKET_NOT_FOUND;
	}

	updateFrontCountdown(currGame: gameParam) {
		if (currGame.countdown == 3 && new Date().getTime() - currGame.startTime > 1000) {
			this.socketGateway.server.to(currGame.roomName).emit("countdown");
			currGame.countdown = 2;
		}
		else if (currGame.countdown == 2 && new Date().getTime() - currGame.startTime > 2000) {
			this.socketGateway.server.to(currGame.roomName).emit("countdown");
			currGame.countdown = 1;
		}
		else if (currGame.countdown == 1 && new Date().getTime() - currGame.startTime > 3000) {
			this.socketGateway.server.to(currGame.roomName).emit("countdown");
			currGame.countdown = 0;
		}
	}

}
