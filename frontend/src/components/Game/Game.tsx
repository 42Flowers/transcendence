import './Game.css'
import SocketContext from '../Socket/Context/Context';
import { useRef, useEffect, useContext, useCallback } from 'react';

const BALL_DEFAULT_RADIUS = 15;

interface scoreElem {
	leftPlayer: string,
	rightPlayer: string,
}

interface gameProps {
	width: number,
	height: number,
	className: string,
	specialMode?: boolean,
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

let leftPaddleColor = 'blue';
let rightPaddleColor = 'blue';

//////////////////////////////
//           GAME           //
//////////////////////////////
const Game: React.FC<gameProps> = (props) => {
	const { SocketState } = useContext(SocketContext);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	let   gameEnd = false;

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
	
	function draw(ctx: CanvasRenderingContext2D): void {
		
		const { width, height } = ctx.canvas;
		const colorYellow = getComputedStyle(document.documentElement).getPropertyValue('--color-yellow').trim();
		const colorPurple = getComputedStyle(document.documentElement).getPropertyValue('--color-purple').trim();

		// draw ball
		const gradientball = ctx.createLinearGradient(0, 0, 0, height);
		gradientball.addColorStop(1, colorYellow);
		gradientball.addColorStop(0, colorPurple);
		ctx.fillStyle = gradientball;
		// ctx.fillStyle = colorPurple;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
		
		// draw left paddle
		const gradientleft = ctx.createLinearGradient(0, 0, 0, height);
		gradientleft.addColorStop(0, colorYellow);
		gradientleft.addColorStop(1, colorPurple);
		ctx.fillStyle = gradientleft;
		// ctx.fillStyle = colorYellow;
		// ctx.fillStyle = leftPaddleColor;
		ctx.fillRect(leftPad.x, leftPad.y, leftPad.width, leftPad.length);
		
		// draw right paddle
		const gradientright = ctx.createLinearGradient(0, 0, 0, height);
		gradientright.addColorStop(0, colorYellow);
		gradientright.addColorStop(1, colorPurple);
		ctx.fillStyle = gradientright;
		// ctx.fillStyle = colorYellow;
		// ctx.fillStyle = rightPaddleColor;
		ctx.fillRect(rightPad.x, rightPad.y, rightPad.width, rightPad.length);
		
		// score
		ctx.fillStyle = colorYellow;
		ctx.font = "40px Short Stack";
		ctx.fillText(score.leftPlayer, Math.round(props.width / 2 / 2), 100);
		ctx.fillText(score.rightPlayer,Math.round(props.width / 2 * 1.5),100);
	};
	
	function renderFrame(context: CanvasRenderingContext2D | null | undefined): void {
		if (context != null && context != undefined) {
			clearBackground(context);
			draw(context);
		}
	};

	const activateShield = useCallback((color: string) => {
		if (color === "left")
			leftPaddleColor = "red";
		else
			rightPaddleColor = "red";
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
		console.log("finish game event");
	}, []);

	const updateScore = useCallback((newScore: {leftPlayer: string, rightPlayer: string}) => {
		leftPaddleColor = "blue"
		rightPaddleColor = "blue"
		score.leftPlayer = newScore.leftPlayer.toString();
		score.rightPlayer = newScore.rightPlayer.toString();
		console.log("update score event");
	}, []);

	const updateGame = useCallback((newLeftPad: paddleElem, newRightPad: paddleElem, newBall: ballElem) => {
		leftPad = newLeftPad;
		rightPad = newRightPad;
		ball = newBall;
		console.log("update game event");
	}, []);
	

	useEffect(() => {

		SocketState.socket?.on("gameFinished", finishGame);
		SocketState.socket?.on("updateScore", updateScore);
		SocketState.socket?.on("updateGame", updateGame);
		SocketState.socket?.on("shield", activateShield);
		
		return () => {
			SocketState.socket?.off("gameFinished", finishGame);
			SocketState.socket?.off("updateScore", updateScore);
			SocketState.socket?.off("updateGame", updateGame);
			SocketState.socket?.off("shield", activateShield);
		};
	}, [SocketState.socket]);

	useEffect(() => {
		const context = canvasRef.current?.getContext('2d');

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		const gameLoop = () => {

			renderFrame(context);

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
