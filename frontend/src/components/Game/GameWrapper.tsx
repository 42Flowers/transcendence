import React, { useCallback, useState } from 'react';
import { useSocketEvent } from '../Socket/Context/Context';
import Game from './Game';
import "./GameWrapper.css";

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
	const [ playersData, setPlayersData ] = useState<playersData | null>(null);

	const displayPlayerData = useCallback((data: playersData) => {
		setPlayersData(data);
	}, [ setPlayersData ]);

	useSocketEvent('playerData', displayPlayerData);

	return (
		<div className="game-wrapper">
			<div className="display-players" >
				{playersData &&
					<>
						<div style={{color: "white"}}>
							<p>{playersData.left.pseudo}</p>
						</div>
						<div style={{color: "white"}}>
							<p>{playersData.right.pseudo}</p>
						</div>
					</>
				}
				{!playersData && <p style={{ color: 'white' }}>Waiting for players data ...</p>}
			</div>
			<div className="game-div">
				<Game className="gameCanvas" width={props.width} height={props.height} specialMode={props.specialMode} />
			</div>
		</div>
	)
}

export default GameWrapper
