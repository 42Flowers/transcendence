import SocketContext from '../Socket/Context/Context';
import React from 'react';
import {  useEffect, useContext, useCallback, useState } from 'react';
import "./GameWrapper.css"
import Game from './Game';

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
	const { SocketState } = useContext(SocketContext);
	const [ playersData, setPlayersData ] = useState<playersData | null>(null);

	const displayPlayerData = useCallback((data: playersData) => {
		setPlayersData(data);
	}, []);

	useEffect(() => {
		SocketState.socket?.on("playerData", displayPlayerData);
		
		return () => {
			SocketState.socket?.off("playerData", displayPlayerData);
		}
	}, [SocketState.socket]);

	return (
		<div className="game-wrapper">
			<div className="display-players" >
				{playersData &&
					<>
						<div>
							<p>{playersData.left.pseudo}</p>
						</div>
						<div>
							<p>{playersData.right.pseudo}</p>
						</div>
					</>
				}
				{!playersData && <p style={{ color: 'white' }}>Waiting for players data ...</p>}
			</div>
			<Game className="gameCanvas" width={props.width} height={props.height} specialMode={props.specialMode} />
		</div>
	)
}

export default GameWrapper
