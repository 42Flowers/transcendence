import './Game.css'
import SocketContext from '../Socket/Context/Context';
import { useRef, useEffect, useContext, useCallback } from 'react';
import { red } from '@mui/material/colors';

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
let leftPaddleColor = "purple";
let rightPaddleColor = "purple";
let dangerousBallColor = "black";
let dangerousBall = false;

let yellowColor = "yellow";
let purpleColor = "purple";
let redColor = "red";
let lastTimeColorCheck = 0;
let change = false;

//////////////////////////////
//           GAME           //
//////////////////////////////
const Game: React.FC<gameProps> = (props) => {
	const { SocketState } = useContext(SocketContext);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	let   gameEnd = false;
	let   gameStart = false;
	let   count = 3;

	let   ball: ballElem = {
		speed: {x: 1, y: 1},
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
		length: Math.round(props.width / 10),
		width: 10,
		x: props.width - 5 - 10,
		y: Math.round(props.height / 2) - Math.round(props.width / 20),
	};
	let   score: scoreElem = {
		leftPlayer: '0',
		rightPlayer: '0',
	}
	
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
		ctx.rect(0, 0, width, height);

		const colorBlue = getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim();
		ctx.fillStyle = colorBlue;
		ctx.fill();
	};
	
	function drawGame(ctx: CanvasRenderingContext2D): void {
		
		const { width, height } = ctx.canvas;
		if (change && new Date().getTime() - lastTimeColorCheck > 1000) {
			leftPaddleColor = purpleColor;
			rightPaddleColor = purpleColor;
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

	function drawStart(ctx: CanvasRenderingContext2D, count: number): void {
		const { width, height } = ctx.canvas;

		ctx.fillStyle = yellowColor;
		ctx.font = "40px Short Stack";
		ctx.fillText("Get READY !", Math.round(width / 3), Math.round(height / 8));
		ctx.fillText(count.toString(), Math.round(width / 2), Math.round(height / 2));
	};

	function drawEnd(ctx: CanvasRenderingContext2D): void {
		const { width, height } = ctx.canvas;

		ctx.fillStyle = yellowColor;
		ctx.font = "40px Short Stack";
		ctx.fillText("Game is Over", Math.round(width / 3), Math.round(height / 2));
		ctx.fillText(score.leftPlayer, Math.round(props.width / 2 / 2), Math.round(height / 8));
		ctx.fillText(score.rightPlayer,Math.round(props.width / 2 * 1.5), Math.round(height / 8));
	}
	
	function renderFrame(context: CanvasRenderingContext2D | null | undefined, count: number): void {
		if (context != null && context != undefined) {
			clearBackground(context);
			if (gameStart == false) {
				drawStart(context, count);
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

	// const calculateWinsAndLosses = (data: User[]) => {
    //     data.map(user => {
    //         user.wins = 0;
    //         user.losses = 0;

    //         user.gameParticipation.forEach(game => {
    //             if (game.game.winnerId === game.userId) {
    //                 user.wins++;
    //             } else {
    //                 user.losses++;
    //             }
    //         });
    //     })
    //     return data;
    // };

	// const calculateRanking = (data: User[]) => {
    //     const ranking =  data.sort((a, b) => {
    //         if (a.wins > b.wins) {
    //             return -1;
    //         }
    //         if (a.wins < b.wins) {
    //             return 1;
    //         }
    //         return a.losses - b.losses;
    //     });
	// 	/* 
	// 		TODO:
	// 		Get id of the leader
	// 		Turn isSmallLeader to true in DB for that user.
	// 	*/
    //     // if (ranking.length >= 3 && ranking[0].id == userId) {
    //     //     setSmallLeader(true);
    //     // } else if (ranking.length >= 10 && ranking[0].id == userId) {
    //     //     setGreatLeader(true);
    //     // }
    //     return ranking;
    // };

	const finishGame = useCallback(() => {
		gameEnd = true;
		/* 
			TODO: Calculate ranking 
		*/
		// fetch(`http://localhost:3000/api/game/ladder`)
        //     .then(response => response.json())
        //     .then(data => {
        //         calculateRanking(calculateWinsAndLosses(data));
        //     }
        // );
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

	const countdown = useCallback(() => {
		count--;
		console.log(count)
		if (count == 0)
			gameStart = true;
	}, []);

	const activateBall = useCallback(() => {
		dangerousBall = true;
	}, [])

	useEffect(() => {

		SocketState.socket?.on("countdown", countdown);
		SocketState.socket?.on("gameFinished", finishGame);
		SocketState.socket?.on("updateScore", updateScore);
		SocketState.socket?.on("updateGame", updateGame);
		if (props.specialMode) {
			SocketState.socket?.on("shield", activateShield);
			SocketState.socket?.on("dangerousBall", activateBall);
		}
		
		return () => {
			SocketState.socket?.off("countdown", countdown);
			SocketState.socket?.off("gameFinished", finishGame);
			SocketState.socket?.off("updateScore", updateScore);
			SocketState.socket?.off("updateGame", updateGame);
			if (props.specialMode) {
				SocketState.socket?.off("shield", activateShield);
				SocketState.socket?.off("dangerousBall", activateBall);
			}
		};
	}, [SocketState.socket]);

	useEffect(() => {
		const context = canvasRef.current?.getContext('2d');

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		const gameLoop = () => {
			renderFrame(context, count);
			if (!gameEnd) {
				window.requestAnimationFrame(gameLoop);
			}
		};

		let frameId = window.requestAnimationFrame(gameLoop);

		return () => {
			window.cancelAnimationFrame(frameId)
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	return <canvas ref={canvasRef} {...props} className='canvasGame'/>;
}

export default Game
