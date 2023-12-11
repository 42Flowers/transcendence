import { EventEmitter2 } from "@nestjs/event-emitter";
import { User } from "@prisma/client";
import { Socket } from "socket.io";
import { GameEndedEvent } from "src/events/game-ended.event";
import { v4 as uuidv4 } from 'uuid';

const SOCKET_NOT_FOUND = -1;

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

interface Paddle {
	x: number,
	y: number,
	width: number,
	length: number,
	activate?: number
}

interface Ball {
	speed: {x: number, y: number},
	speedModifier: number,
	x: number,
	y: number,
	radius: number,
}

interface KeyState {
	leftPadArrowUp: boolean;
	leftPadArrowDown: boolean;
	leftPadSpacebar?: boolean;

	rightPadArrowUp: boolean;
	rightPadArrowDown: boolean;
	rightPadSpacebar?: boolean;
}

export enum GameState {
    Waiting,
    Countdown,
    Running,
    Ended,
}

export enum GameMode {
    Normal,
    Special,
}

export class Game {
    private gameState: GameState;
    private leftPlayerSocket: Socket;
    private rightPlayerSocket?: Socket;
    private startTime: number;
    private countdown: number;
    private readonly gameMode: GameMode;
    private gameDuration: number;
    private lastCountDownTick: number;
    private readonly leftPlayer: User;
    private readonly rightPlayer: User;

    private leftPad: Paddle;
	private rightPad: Paddle;
	private ball: Ball;
	private keys: KeyState;

    private leftPlayerScore: number;
    private rightPlayerScore: number;

    private readonly eventEmitter: EventEmitter2;

    constructor(eventEmitter: EventEmitter2, leftPlayer: User, rightPlayer: User, gameMode: GameMode) {
        this.leftPlayer = leftPlayer;
        this.rightPlayer = rightPlayer;
        this.gameMode = gameMode;
        this.gameState = GameState.Waiting;
        this.eventEmitter = eventEmitter;
        this.gameDuration = 0;
    }

    private onSocketAttached(socket: Socket) {
        socket.game = this;

        if (GameState.Waiting === this.gameState) {
            if (GameMode.Special === this.gameMode) {
                socket.emit('launchSpecial');
            } else {
                socket.emit('launchNormal');
            }
        }
    
        if (this.leftPlayerSocket !== undefined && this.rightPlayerSocket !== undefined) {
            this.start();
        }
    }

    attachLeftPlayerSocket(socket: Socket) {
        this.leftPlayerSocket = socket;
        this.onSocketAttached(socket);
    }

    attachRightPlayerSocket(socket: Socket) {
        this.rightPlayerSocket = socket;
        this.onSocketAttached(socket);
    }

    /**
     * Transitions into the countdown state
     */
    start() {
        this.gameState = GameState.Countdown;
        this.countdown = 3;
        this.lastCountDownTick = Date.now();
        this.leftPlayerScore = 0;
        this.rightPlayerScore = 0;

        this.emitToPlayers('playerData', {
            left: {
                pseudo: this.leftPlayerSocket.user.pseudo,
            },
            right: {
                pseudo: this.rightPlayerSocket.user.pseudo,
            },
        });

        this.updateCountdown();

        this.keys = {
            leftPadArrowDown: false,
            leftPadArrowUp: false,
            rightPadArrowDown: false,
            rightPadArrowUp: false,
            leftPadSpacebar: false,
            rightPadSpacebar: false,
        };
        
        this.leftPad = {
            x: 5,
            y: Math.round(BOARD_HEIGHT / 2) - Math.round(BOARD_WIDTH / 20),
            width: 10,
            length: Math.round(BOARD_WIDTH / 10),
            activate: SHIELD_NOT_ACTIVATED,
        };
        
        this.rightPad = {
            x: BOARD_WIDTH - 5 - 10,
            y: Math.round(BOARD_HEIGHT / 2) - Math.round(BOARD_WIDTH / 20),
            width: 10,
            length: Math.round(BOARD_WIDTH / 10),
            activate: SHIELD_NOT_ACTIVATED,
        };

        this.ball = {
            speed: {
                x: 1, y: 1
            },
            speedModifier: BALL_SPEED_MOD,
            x: Math.round(BOARD_WIDTH / 2),
            y: Math.round(BOARD_HEIGHT / 2),
            radius: BALL_RADIUS,
        };
    }

    getGameState() { return this.gameState; }
    getGameDuration() { return this.gameDuration; }
    getLeftPlayerUser() { return this.leftPlayer; }
    getRightPlayerUser() { return this.rightPlayer; }
    getLeftPlayerScore() { return this.leftPlayerScore; }
    getRightPlayerScore() { return this.rightPlayerScore; }

    updateCountdown() {
        this.emitToPlayers('countdown', this.countdown.toString());
    }

    tick() {
        /* Update game duration only when in countdown or playing state */
        if (this.gameState === GameState.Running) {
            this.gameDuration = Date.now() - this.startTime;
        }

        if (this.gameState === GameState.Countdown) {
            const now = Date.now();
            const timeSinceLastCountdownTick = now - this.lastCountDownTick;

            if (this.countdown === 0) {
                this.gameState = GameState.Running;
                this.emitToPlayers('gameStart');
                this.resetBoard();
                this.sendGameUpdatePacket();
            } else {
               if (timeSinceLastCountdownTick >= 1000) {
                   this.countdown -= 1;
                   this.lastCountDownTick = now;

                   this.updateCountdown();
                }
            }
        } else if (this.gameState === GameState.Running) {
            this.moveBall();
            this.updatePaddles();
            this.checkGoal();
            this.sendGameUpdatePacket();

            if (this.leftPlayerScore >= 3 || this.rightPlayerScore >= 3) {
                this.gameState = GameState.Ended;
                this.leftPlayerSocket.game = undefined;
                this.rightPlayerSocket.game = undefined;
                this.emitToPlayers('gameFinished');
                this.eventEmitter.emit('game.ended', new GameEndedEvent(this));
            }
        }
    }

    private resetBoard() {
		this.ball.speed.y = 0;
		while (Math.abs(this.ball.speed.y) <= 0.2 || Math.abs(this.ball.speed.y) >= 0.8) {
			const heading = Math.random() * (2 * Math.PI);
			const x_dir = Math.random() >= 0.5 ? 1 : -1;
			this.ball.speed = { x: BALL_SPEED_X * x_dir, y: Math.sin(heading) }
		}

		this.ball.speedModifier = BALL_SPEED_MOD;
		this.ball.x = Math.round(BOARD_WIDTH / 2);
		this.ball.y = Math.round(BOARD_HEIGHT / 2);

		this.leftPad.y = Math.round(BOARD_HEIGHT / 2) - Math.round(this.leftPad.length / 2);
		this.rightPad.y = Math.round(BOARD_HEIGHT / 2) - Math.round(this.rightPad.length / 2);
	}
    
    private sendGameUpdatePacket() {
		this.emitToPlayers('updateGame', this.leftPad, this.rightPad, this.ball);
    }

    private checkGoal() {
        const { ball } = this;
        let scoreUpdated = false;

        if (ball.x <= 0) {
			this.rightPlayerScore += 1;
            scoreUpdated = true;
		}
		else if (ball.x >= BOARD_WIDTH) {
			this.leftPlayerScore += 1;
            scoreUpdated = true;
		}

        if (scoreUpdated) {
            this.emitToPlayers('updateScore', {
                leftPlayer: this.leftPlayerScore,
                rightPlayer: this.rightPlayerScore,
            });
			this.resetBoard();
        }
	}

    private checkWallCollision() {
        const { y, radius, speed } = this.ball;

        if ((y - radius <= 0 && speed.y < 0)
            || (y + radius >= BOARD_HEIGHT && speed.y > 0))

            this.ball.speed.y *= -1;
    }

    private moveBall() {
        const { ball, leftPad, rightPad } = this;

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

            if (this.gameMode === GameMode.Special &&
                Math.abs(Date.now() - leftPad.activate) < SHIELD_MAX_INTERVAL) {

                this.emitToPlayers('shield', 'left');
                if (ball.speedModifier + 0.2 >= SPEED_THRESHOLD) {
                    this.emitToPlayers('dangerousBall');
                }
                ball.speedModifier += 0.2;
                ball.speed.x *= -1;
                ball.speed.y = ball.speed.x * BALL_SPEED_Y * (relativeBallPos / leftPad.length / 2);
            }
            else if (this.gameMode === GameMode.Special && ball.speedModifier > SPEED_THRESHOLD && Math.abs(currTime - rightPad.activate) >= 400) {
                this.emitToPlayers('breakPaddle', 'right');
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

            if (this.gameMode === GameMode.Special && Math.abs(currTime - rightPad.activate) < SHIELD_MAX_INTERVAL) {
                this.emitToPlayers('shield', 'right');
                if (ball.speedModifier + 0.2 >= SPEED_THRESHOLD) {
                    this.emitToPlayers('dangerousBall');
                }
                ball.speedModifier += 0.2;
                ball.speed.x *= -1;
                ball.speed.y = ball.speed.x * (BALL_SPEED_Y * -1) * (relativeBallPos / rightPad.length / 2);
            }
            else if (this.gameMode === GameMode.Special && ball.speedModifier > SPEED_THRESHOLD && Math.abs(currTime - rightPad.activate) >= 400) {
                this.emitToPlayers('breakPaddle', 'right');

            }
            else {
                ball.speed.x *= -1;
                ball.speed.y = ball.speed.x * (BALL_SPEED_Y * -1) * (relativeBallPos / rightPad.length / 2);
            }
            rightPad.activate = SHIELD_NOT_ACTIVATED;
            TURN = LEFT;
        }

		this.checkWallCollision();

        this.ball.x += this.ball.speed.x * this.ball.speedModifier;
        this.ball.y += this.ball.speed.y * this.ball.speedModifier;
	}

    private updatePaddles() {
		if (this.keys.leftPadArrowUp) {
			this.leftPad.y -= PADDLE_SPEED;
		}
		if (this.keys.leftPadArrowDown) {
			this.leftPad.y += PADDLE_SPEED;
		}
		this.leftPad.y = Math.max(0, this.leftPad.y);
		this.leftPad.y = Math.min(BOARD_HEIGHT - this.leftPad.length, this.leftPad.y);
		
		// RIGHT PLAYER MOVEMENT
		if (this.keys.rightPadArrowUp) {
			this.rightPad.y -= PADDLE_SPEED;
		}
		if (this.keys.rightPadArrowDown) {
			this.rightPad.y += PADDLE_SPEED;
		}
		this.rightPad.y = Math.max(0, this.rightPad.y);
		this.rightPad.y = Math.min(BOARD_HEIGHT - this.rightPad.length, this.rightPad.y);
	}


    public handleKey(socket: Socket, key: string, state: boolean) {
        if (GameState.Running !== this.gameState)
            return ;

        if (socket.id === this.leftPlayerSocket.id) {
            if (key === "ArrowUp") {
                this.keys.leftPadArrowUp = state;
            }
            else if (key === "ArrowDown") {
                this.keys.leftPadArrowDown = state;
            }
            else if (key === " ") {
                this.keys.leftPadSpacebar = state;
                if (state && this.leftPad.activate == SHIELD_NOT_ACTIVATED && TURN == LEFT) {
                    this.leftPad.activate = Date.now();
                }
            }
        }
        else if (socket.id === this.rightPlayerSocket.id) {
            if (key === "ArrowUp") {
                this.keys.rightPadArrowUp = state;
            }
            else if (key === "ArrowDown") {
                this.keys.rightPadArrowDown = state;
            }
            else if (key === " ") {
                this.keys.rightPadSpacebar = state;
                if (state && this.rightPad.activate == SHIELD_NOT_ACTIVATED && TURN == RIGHT) {
                    this.rightPad.activate = Date.now();
                }
            }
        }
    }

    private emitToPlayers(ev: string, ...args: any[]) {
        this.leftPlayerSocket.emit(ev, ...args);
        this.rightPlayerSocket.emit(ev, ...args);
    }
}