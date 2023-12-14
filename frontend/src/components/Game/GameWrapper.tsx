import get from 'lodash/get';
import React from 'react';
import { useSocketEvent } from '../Socket/Context/Context';
import Game from './Game';
import "./GameWrapper.css";
import ReturnMenu from './ReturnMenu/ReturnMenu';

interface wrapperProps {
	width: number,
	height: number,
	specialMode: boolean,
}

interface playersData {
	left: {
		pseudo: string,
	},
	right: {
		pseudo: string,
	},
}

const GameWrapper: React.FC<wrapperProps> = (props) => {
	const [ playersData, setPlayersData ] = React.useState<playersData>();
	const [ gameEnded, setGameEnded ] = React.useState(false);
	const [ leftScore, setLeftScore ] = React.useState<string>('0');
	const [ rightScore, setRightScore ] = React.useState<string>('0');

	const endGame = () => {
		setGameEnded(true);
	}
	
	const updatePlayersScore = (newScore: {leftPlayer: string, rightPlayer: string}) => {
		setLeftScore(newScore.leftPlayer);
		setRightScore(newScore.rightPlayer);
	}
	
	useSocketEvent('playerData', data => setPlayersData(data));
	useSocketEvent('gameFinished', endGame);
	useSocketEvent('updateScore', updatePlayersScore);

	return (
		<div className="game-wrapper">
			{!gameEnded &&
				<>
					<div className="display-players" >
						{playersData &&
							<>
								<div style={{color: "white"}}>
									<p>{get(playersData, 'left.pseudo')}</p>
								</div>
								<div style={{color: "white"}}>
									<p>{get(playersData, 'right.pseudo')}</p>
								</div>
							</>
						}
						{!playersData &&
							<>
								<p style={{ color: 'white' }}>Waiting for players data ...</p>
							</>
						}
					</div>
					<div className="game-div">
						<Game className="gameCanvas" width={props.width} height={props.height} specialMode={props.specialMode} />
					</div>
				</>
			}
			<div className="game-div">
				{gameEnded  && 
					<ReturnMenu
						leftName={playersData?.left?.pseudo ?? 'Left Player'}
						rightName={playersData?.right?.pseudo ?? 'Right Player'}
						leftScore={leftScore}
						rightScore={rightScore}
					/> }
			</div>
		</div>
	)
}

export default GameWrapper
