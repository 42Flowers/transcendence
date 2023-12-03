import SocketContext from '../Socket/Context/Context';
import { useRef, useEffect, useContext, useCallback } from 'react';
import Game from './Game';

interface wrapperProps {
	width: number,
	height: number,
	specialMode: boolean,
}

interface playerData {
	id: number,
	pseudo: string,
	avatar?: string, 
}

const GameWrapper: React.FC<wrapperProps> = (props) => {
	const { SocketState } = useContext(SocketContext);

	const displayPlayerAvatar = useCallback((player: string, data: playerData) => {
		if (player === "left") {

		}
		else if (player === "right") {

		}
	}, []);

	useEffect(() => {
		SocketState.socket?.on("avatar", displayPlayerAvatar);
		
		return () => {
			SocketState.socket?.off("avatar", displayPlayerAvatar);
		}
	}, []);

	return (
		<div>
			<Game className="gameCanvas" width={props.width} height={props.height} specialMode={props.specialMode} />
		</div>
	)
}

export default GameWrapper
