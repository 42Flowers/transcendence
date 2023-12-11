import './Game.css'
import SocketContext, { useSocketEvent } from '../Socket/Context/Context';
import React, { useRef, useEffect, useContext, useCallback } from 'react';

const BOARD_WIDTH = 800; // in px
const BOARD_HEIGHT = 600; // in px
const BALL_DEFAULT_RADIUS = 15;

interface scoreElem {
	leftPlayer: string,
	rightPlayer: string,
}

interface gameProps {
	width: number,
	height: number,
	className: string,
	specialMode: boolean,
}

interface paddleElem {
	x: number,
	y: number,
	width: number,
	length: number
}

interface ballElem {
	speed: {x: number, y: number},
	x: number,
	y: number,
	radius: number,
}

// const colorYellow = getComputedStyle(document.documentElement).getPropertyValue('--color-yellow').trim();
// const colorPurple = getComputedStyle(document.documentElement).getPropertyValue('--color-purple').trim();
let leftPaddleColor = "yellow";
let rightPaddleColor = "yellow";
let dangerousBallColor = "black";
let dangerousBall = false;

let yellowColor = "yellow";
let purpleColor = "purple";
let redColor = "red";
let lastTimeColorCheck = 0;
let change = false;

let   gameEnd = false;
let   gameStart = false;
let   countdownMessage = '';
let   lastCountdownReceivedTime = 0;

let   ball: ballElem = {
	speed: {x: 1, y: 1},
	x: 0,
	y: 0,
	radius: BALL_DEFAULT_RADIUS,
};

let   leftPad: paddleElem = {
	length: 0,
	width: 10,
	x: 5,
	y: 0,
};

let   rightPad: paddleElem = {
	length: 0,
	width: 10,
	x: 0,
	y: 0,
};

let   score: scoreElem = {
	leftPlayer: '0',
	rightPlayer: '0',
}

function resetGame(width: number, height: number) {
	gameEnd = false;
	gameStart = true;

	console.log('Game RESET !');

	ball = {
		speed: {x: 1, y: 1},
		x: Math.round(width / 2),
		y: Math.round(height / 2),
		radius: BALL_DEFAULT_RADIUS,
	};
	leftPad = {
		length: Math.round(width / 10),
		width: 10,
		x: 5,
		y: Math.round(height / 2) - Math.round(width / 20),
	};
	rightPad = {
		length: Math.round(width / 10),
		width: 10,
		x: width - 5 - 10,
		y: Math.round(height / 2) - Math.round(width / 20),
	};
	score = {
		leftPlayer: '0',
		rightPlayer: '0',
	}
}

function useAnimationFrame(cb: () => void, deps: React.DependencyList = []) {
	const requestRef = React.useRef<number>(-1);

	React.useEffect(() => {
		const animate = () => {
			cb();

			requestRef.current = window.requestAnimationFrame(animate);
		};

		requestRef.current = window.requestAnimationFrame(animate);

		return () => {
			window.cancelAnimationFrame(requestRef.current);
		}
	}, [ cb, ...deps ]);
}

//////////////////////////////
//           GAME           //
//////////////////////////////
const Game: React.FC<gameProps> = (props) => {
	const { SocketState } = useContext(SocketContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ctx = canvasRef.current?.getContext('2d');
	
	function handleKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		SocketState.socket?.emit("keyDown", event.key);
	};
	
	function handleKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		SocketState.socket?.emit("keyUp", event.key);
	};
	
	function clearBackground(ctx: CanvasRenderingContext2D): void {
		const { width, height } = ctx.canvas;
		ctx.clearRect(0, 0, width, height);
		ctx.rect(0, 0, width, height);

		const colorBlue = getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim();
		ctx.fillStyle = colorBlue;
		ctx.fill();
	};
	
	function drawGame(ctx: CanvasRenderingContext2D): void {
		
		const { width, height } = ctx.canvas;
		if (change && new Date().getTime() - lastTimeColorCheck > 1000) {
			leftPaddleColor = yellowColor;
			rightPaddleColor = yellowColor;
			change = false;
		}

		// draw ball
		const gradientball = ctx.createLinearGradient(0, 0, 0, height);
		gradientball.addColorStop(1, yellowColor);
		gradientball.addColorStop(0, purpleColor);
		if (dangerousBall)
			ctx.fillStyle = dangerousBallColor;
		else
			ctx.fillStyle = gradientball;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
		
		// draw left paddle
		
		ctx.fillStyle = leftPaddleColor;
		ctx.fillRect(leftPad.x, leftPad.y, leftPad.width, leftPad.length);
		
		// draw right paddle
		
		ctx.fillStyle = rightPaddleColor;
		ctx.fillRect(rightPad.x, rightPad.y, rightPad.width, rightPad.length);
		
		// score
		ctx.fillStyle = purpleColor;
		ctx.font = "40px Short Stack";
		ctx.fillText(score.leftPlayer, Math.round(width / 2 / 2), Math.round(height / 8));
		ctx.fillText(score.rightPlayer,Math.round(width / 2 * 1.5), Math.round(height / 8));
	};

	function drawStart(ctx: CanvasRenderingContext2D): void {
		const { width, height } = ctx.canvas;

		ctx.fillStyle = yellowColor;
		ctx.font = "40px Short Stack";
		ctx.fillText("Get READY !", Math.round(width / 3), Math.round(height / 8));

		const t = Math.min(1.0, (Date.now() - lastCountdownReceivedTime) / 250);

		ctx.save();
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.translate(width / 2, height / 2);
		ctx.scale(5.0 - t * 4.0, 5.0 - t * 4.0);
		ctx.globalAlpha = 0.2 + t * 0.8;
		ctx.fillText(countdownMessage, 0, 0);
		ctx.restore();
	};

	function drawEnd(ctx: CanvasRenderingContext2D): void {
		const { width, height } = ctx.canvas;

		ctx.fillStyle = yellowColor;
		ctx.font = "40px Short Stack";
		ctx.fillText("Game is Over", Math.round(width / 3), Math.round(height / 2));
		ctx.fillText(score.leftPlayer, Math.round(props.width / 2 / 2), Math.round(height / 8));
		ctx.fillText(score.rightPlayer,Math.round(props.width / 2 * 1.5), Math.round(height / 8));
	}
	
	function renderFrame(context: CanvasRenderingContext2D | null | undefined): void {
		if (context != null && context != undefined) {
			clearBackground(context);
			if (gameStart == false) {
				drawStart(context);
			}
			else if (gameEnd == true)
				drawEnd(context);
			else
				drawGame(context);
		}
	};

	const activateShield = useCallback((side: string) => {
		if (side == "left") {
			leftPaddleColor = redColor
			lastTimeColorCheck = new Date().getTime();
			change = true;
		}
		else if (side == "right") {
			rightPaddleColor = redColor;
			lastTimeColorCheck = new Date().getTime();
			change = true;
		}
	}, []);

	const finishGame = useCallback(() => {
		gameEnd = true;
	}, []);

	const updateScore = useCallback((newScore: {leftPlayer: string, rightPlayer: string}) => {
		score.leftPlayer = newScore.leftPlayer.toString();
		score.rightPlayer = newScore.rightPlayer.toString();
		dangerousBall = false;
	}, []);

	const updateGame = useCallback((newLeftPad: paddleElem, newRightPad: paddleElem, newBall: ballElem) => {
		leftPad = newLeftPad;
		rightPad = newRightPad;
		ball = newBall;
	}, []);

	const countdown = useCallback((msg: string) => {
		countdownMessage = msg;
		lastCountdownReceivedTime = Date.now();
		gameEnd = false;
		gameStart = false;
	}, []);

	const activateBall = useCallback(() => {
		dangerousBall = true;
	}, [])

	useSocketEvent('gameStart', () => resetGame(props.width, props.height));
	useSocketEvent('countdown', countdown);
	useSocketEvent('gameFinished', finishGame);
	useSocketEvent('updateScore', updateScore);
	useSocketEvent('updateGame', updateGame);

	useEffect(() => {
		if (props.specialMode) {
			SocketState.socket?.on("shield", activateShield);
			SocketState.socket?.on("dangerousBall", activateBall);
			return () => {
				SocketState.socket?.off("shield", activateShield);
				SocketState.socket?.off("dangerousBall", activateBall);
			};
		}
	}, [SocketState.socket]);

	useAnimationFrame(() => {
		const ctx = canvasRef.current?.getContext('2d');
		if (ctx) {
			renderFrame(ctx);
		}
	}, []);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	return <canvas ref={canvasRef} {...props} className='canvasGame'/>;
}

export default Game
