import './game.css'
import { useRef, useEffect } from 'react';

const BALL_SPEED_MOD = 250;
const PADDLE_SPEED = 500;
const BALL_DEFAULT_RADIUS = 15;
const BALL_SPEED_Y = 5;
const BALL_SPEED_X = 1.5;
// const MAX_BALL_SPEED = ;

const GAME_MAX_GOAL = 2;

interface scoreElem {
	leftPlayer: string,
	rightPlayer: string,
}

interface gameProps {
	width: number,
	height: number,
	className: string,
}

interface paddleElem {
	x: number,
	y: number,
	width: number,
	length: number
}

interface ballElem {
	speed: {x: number, y: number},
	speedModifyer: number,
	x: number,
	y: number,
	radius: number,
}

interface keyState {
	[key: string]: boolean,
}

//////////////////////////////
//           GAME           //
//////////////////////////////
function Game (props: gameProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const leftPlayerKey: keyState = {};
	const rightPlayerKey: keyState = {};
	let   lastFrameTime: number | null = null
	let   ball: ballElem = {
		speed: {x: 1, y: 1},
		speedModifyer:BALL_SPEED_MOD,
		x: Math.round(props.width / 2),
		y: Math.round(props.height / 2),
		radius: BALL_DEFAULT_RADIUS,
	};
	let   leftPad: paddleElem = {
		length: Math.round(props.width / 10),
		width: 10,
		x: 5,
		y: Math.round(props.height / 2) - Math.round(props.width / 20),
	};
	let   rightPad: paddleElem = {
		length: props.height,//Math.round(props.width / 10),
		width: 10,
		x: props.width - 15,
		y: 0,//Math.round(props.height / 2) - Math.round(props.width / 20),
	};
	let   score: scoreElem = {
		leftPlayer: '0',
		rightPlayer: '0',
	}
	
	function handleKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		leftPlayerKey[event.key] = true;
	};
	
	function handleKeyUp(event: KeyboardEvent) {
		event.preventDefault;
		delete leftPlayerKey[event.key];
	};
	
	function clearBackground(ctx: CanvasRenderingContext2D): void {
		const { width, height } = ctx.canvas;
		ctx.rect(0, 0, width, height);
		ctx.fillStyle = 'white';
		ctx.fill();
	};
	
	function draw(ctx: CanvasRenderingContext2D): void {
		
		// draw ball
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
		
		// draw left paddle
		ctx.fillStyle = 'blue';
		ctx.fillRect(leftPad.x, leftPad.y, leftPad.width, leftPad.length);
		
		// draw right paddle
		ctx.fillStyle = 'blue';
		ctx.fillRect(rightPad.x, rightPad.y, rightPad.width, rightPad.length);
		
		ctx.fillStyle = "green";
		ctx.font = "40px Orbitron";
		ctx.fillText(score.leftPlayer, Math.round(props.width / 2 / 2), 100);
		ctx.fillText(score.rightPlayer,Math.round(props.width / 2 * 1.5),100);
	};
	
	function renderFrame(context: CanvasRenderingContext2D | null | undefined): void {
		if (context != null && context != undefined) {
			clearBackground(context);
			draw(context);
		}
	};
	
	function resetGamePosition(): void {

		while (Math.abs(ball.speed.y) <= 0.2 || Math.abs(ball.speed.y) >= 0.9) {
			const heading = Math.random() * (2 * Math.PI - 0) + 0;
			ball.speed = { x: BALL_SPEED_X, y: Math.sin(heading) }
		}

		ball.speedModifyer = BALL_SPEED_MOD;
		ball.x = Math.round(props.width / 2);
		ball.y = Math.round(props.height / 2);

		leftPad.y = Math.round(props.height / 2) - Math.round(props.width / 20)
		rightPad.y = Math.round(props.height / 2) - Math.round(props.width / 20)
	};

	function movePaddles(delta: number): void {

		// LEFT PLAYER MOVEMENT
		if (leftPlayerKey['ArrowUp']) {
			leftPad.y -= PADDLE_SPEED * delta;
		}
		if (leftPlayerKey['ArrowDown']) {
			leftPad.y += PADDLE_SPEED * delta;
		}
		leftPad.y = Math.max(0, leftPad.y);
		leftPad.y = Math.min(props.height - leftPad.length, leftPad.y);
		
		// RIGHT PLAYER MOVEMENT
		if (rightPlayerKey['ArrowUp']) {
			rightPad.y -= PADDLE_SPEED * delta;
		}
		if (rightPlayerKey['ArrowDown']) {
			rightPad.y += PADDLE_SPEED * delta;
		}
		rightPad.y = Math.max(0, rightPad.y);
		rightPad.y = Math.min(props.height - rightPad.length, rightPad.y);
	};

	function checkGoal(): void {
		if (ball.x - ball.radius <= 0) {
			score.rightPlayer = (parseInt(score.rightPlayer) + 1).toString();
			resetGamePosition();
		}
		else if (ball.x + ball.radius >= props.width) {
			score.leftPlayer = (parseInt(score.leftPlayer) + 1).toString();
			resetGamePosition();
		}
	}

	function moveBall(delta: number): void {
		
		function checkWallCollision() {
			if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= props.height)
			ball.speed.y *= -1;
		}
	
		function checkPaddleCollision() {

			function leftPaddleCollision(): boolean {
				if (ball.x - ball.radius <= leftPad.x + leftPad.width
					&& ball.y + ball.radius >= leftPad.y
					&& ball.y - ball.radius <= leftPad.y + leftPad.length
					) {
					return true;
				}
				return false;
			}

			function rightPaddleCollision(): boolean {
				if (ball.x + ball.radius >= rightPad.x
					&& ball.y + ball.radius >= rightPad.y
					&& ball.y - ball.radius <= rightPad.y + rightPad.length
					) {
						return true;
				}
				return false;
			}

			if (leftPaddleCollision()) {
				const relativeBallPos = ball.y - (leftPad.y + leftPad.length / 2);
				ball.speed.x *= -1;
				ball.speed.y = ball.speed.x * BALL_SPEED_Y * (relativeBallPos / leftPad.length / 2);
				console.log("LEFT relative ball pos", relativeBallPos);
				console.log("LEFT x speed=  ", ball.speed.x);
			}
			if (rightPaddleCollision()) {
				const relativeBallPos = ball.y - (rightPad.y + rightPad.length / 2);
				ball.speed.x *= -1;
				ball.speed.y = ball.speed.x * (BALL_SPEED_Y * -1) * (relativeBallPos / rightPad.length / 2);
				console.log("RIGHT relative ball pos", relativeBallPos);
				console.log("RIGHT x speed=  ", ball.speed.x);
			}
		}

		checkWallCollision();
		checkPaddleCollision();
		ball.x += ball.speed.x * ball.speedModifyer * delta;
		ball.y += ball.speed.y * ball.speedModifyer * delta;
	};

	function updateGame(delta: number): void {
		checkGoal();
		movePaddles(delta);
		moveBall(delta);
	};

	function checkWin(): boolean {
		if (parseInt(score.leftPlayer) >= GAME_MAX_GOAL || parseInt(score.rightPlayer) >= GAME_MAX_GOAL)
			return true;
		return false;
	}

	useEffect(() => {
		const context = canvasRef.current?.getContext('2d');

		// Set up listeners
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		// Init game
		resetGamePosition();

		// GAME LOOP
		const gameLoop = (time: number) => {
			// Update game state
			if (lastFrameTime !== null) {
				const delta = (time - lastFrameTime) / 1000
				updateGame(delta);
			}

			// Clear canvas and Draw game elements
			renderFrame(context);

			// Request next frame if no winner
			lastFrameTime = time;
			if (!checkWin()) {
				window.requestAnimationFrame(gameLoop);
			}
		};

		// Start game loop
		let frameId = window.requestAnimationFrame(gameLoop);

		return () => {
			window.cancelAnimationFrame(frameId)
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	return <canvas ref={canvasRef} {...props}/>;
}

export default Game
