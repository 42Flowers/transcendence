import './game.css'
import React, { useRef, useEffect, useState } from 'react';

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
	x: number,
	y: number,
	size: number,
}

type canvasContext = CanvasRenderingContext2D



//////////////////////////////
//           GAME           //
//////////////////////////////
function Game (props: gameProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	
	// DEPENDING ON SCREEN SIZE:   ball.size, leftPad.width, rightPad.width
	const [ball, setBall] = useState<ballElem>({
		x: Math.round(props.width / 2),
		y: Math.round(props.height / 2),
	  	size: 15,
	})
	
	const [leftPad, setLeftPad] = useState<paddleElem>({
		length: Math.round(props.width / 10),
		width: 10,
		x: 5,
		y: Math.round(props.height / 2) - Math.round(props.width / 20),
	})
	
	const [rightPad, setRightPad] = useState<paddleElem>({
		length: Math.round(props.width / 10),
		width: 10,
		x: props.width - 15,
		y: Math.round(props.height / 2) - Math.round(props.width / 20),
	})
	
	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);
		
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, [leftPad]);
	
	useEffect(() => {
		window.requestAnimationFrame(renderFrame);
	}, [ball, leftPad, rightPad]);
	
	function handleKeyPress(event: KeyboardEvent): void {
		const canvas = canvasRef.current;
		if (canvas == null) {
			return;
		}

		if (event.key === 'ArrowUp' && leftPad.y > 0) {
			console.log('LEFT-UP', leftPad.y)
			setLeftPad((pad: paddleElem) => ({
				...pad,
				y: pad.y - 10,
			}));
		}
		else if (event.key === 'ArrowDown' && leftPad.y < 580) {
			console.log('LEFT-DOWN', leftPad.y)
			setLeftPad((pad: paddleElem) => ({
				...pad,
				y: pad.y + 10,
			}));
		}
	};

	function clearBackground(ctx: canvasContext): void {
		const { width, height } = ctx.canvas;
		ctx.rect(0, 0, width, height);
		ctx.fillStyle = 'white';
		ctx.fill();
	}
	
	function draw(ctx: canvasContext): void {
		
		// draw ball
		ctx.fillStyle = 'blue'
		ctx.beginPath()
		ctx.arc(ball.x, ball.y, ball.size, 0, 2*Math.PI)
		ctx.closePath()
		ctx.fill()
		
		// draw left paddle
		ctx.fillStyle = 'blue'
		ctx.fillRect(leftPad.x, leftPad.y, leftPad.width, leftPad.length)
		
		// draw right paddle
		ctx.fillStyle = 'blue'
		ctx.fillRect(rightPad.x, rightPad.y, rightPad.width, rightPad.length)
	}
	
	function renderFrame(): void {
		const context = canvasRef.current?.getContext('2d');
		if (context != null) {
			clearBackground(context);
			draw(context)
		}
	}
	
	return <canvas ref={canvasRef} {...props}/>
}

export default Game

