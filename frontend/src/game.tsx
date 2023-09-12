import './game.css'
import React, { useRef, useEffect, useState } from 'react';

type gameProps = {
	width: number,
	height: number,
	className: string,
}

type paddleElem = {
	x: number,
	y: number,
	width: number,
	length: number
}

type ballElem = {
	x: number,
	y: number,
	size: number,
}

type canvasContext = CanvasRenderingContext2D

function Game (props: gameProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	
	const ball = {
		x: 600,
		y: 350,
	  size: 15
	}
	
	const [leftPad, setLeftPad] = useState({
		x: 5,
		y: 290,
		width: 10,
		length: 120
	})
	
	const rightPad = {
		x: 1185,
		y: 290,
		width: 10,
		length: 120
	}
	
	const drawGround = (ctx: canvasContext) => {
		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, props.width, props.height)
	}
	
	const drawBall = (ctx: canvasContext) => {
		ctx.fillStyle = 'blue'
		ctx.beginPath()
		ctx.arc(ball.x, ball.y, ball.size, 0, 2*Math.PI)
		ctx.closePath()
	  ctx.fill()
	}
	
	const drawLeftPad = (ctx: canvasContext) => {
		ctx.fillStyle = 'blue'
		ctx.fillRect(leftPad.x, leftPad.y, leftPad.width, leftPad.length)
	}
	
	const drawRightPad = (ctx: canvasContext) => {
		ctx.fillStyle = 'blue'
		ctx.fillRect(rightPad.x, rightPad.y, rightPad.width, rightPad.length)
	}
	
	useEffect(() => {
	  const canvas = canvasRef.current
	  const context = canvas != null ? canvas.getContext('2d') : null

	  if (context != null) {
		  drawGround(context)
		  drawBall(context)
		  drawLeftPad(context)
		  drawRightPad(context)
		}
	}, [ball, leftPad, rightPad]);
	
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'ArrowUp') {
				console.log('LEFT-UP')
				setLeftPad((pad: paddleElem) => ({
					...pad,
					y: pad.y - 10,
				}));
			}
			else if (event.key === 'ArrowDown') {
				console.log('LEFT-DOWN')
				setLeftPad((pad: paddleElem) => ({
					...pad,
					y: pad.y + 10,
				}));
			}
		};

		document.addEventListener('keydown', handleKeyPress);

		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	return <canvas ref={canvasRef} {...props}/>
  }

  export default Game

