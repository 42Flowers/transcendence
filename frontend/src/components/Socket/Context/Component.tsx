import React, { PropsWithChildren, useEffect, useReducer, useState } from 'react';
import { useSocket } from '../Hooks/useSocket';
import { defaultSocketContextState, SocketContextProvider, SocketReducer } from './Context';

const SocketContextComponent: React.FC<PropsWithChildren> = ({ children }) => {
	const [SocketState, SocketDispatch] = useReducer(SocketReducer, defaultSocketContextState);
	const [loading, setLoading] = useState(true);

	const socket = useSocket(import.meta.env.WEBSOCKET_URL, {
		reconnectionAttempts: 5,
		reconnectionDelay: 5000,
		autoConnect: false
	});

	useEffect(() => {
		/**Connect to the web socket */
		socket.connect()
		/*Save the socket  in context*/
		console.log({current: socket.id});
		console.log('sympa', socket);
		SocketState.socket = socket;
		// SocketDispatch({type: 'update_socket', payload: socket.id });
		/**Start the event listeners */
		StartListeners();
		/**Send the handshake */
		SendHandshake();

		// eslint-disable-next-line
	}, [socket]);

	const StartListeners = () => {

		/**Reconnect Event */
		socket.io.on('reconnect', (attempt: number) => {
			console.info('Reconnected on attempt: ', + attempt);
		});
		/**Reconnect attemp event */
		socket.io.on('reconnect_attempt', (attempt: number) => {
			console.info('Reconnection attempt: ', + attempt );
		});

		/**Reconnection Error */
		socket.io.on('reconnect_error', (error) => {
			console.info('Reconnection error: ', + error);
		});

		/**Reconnection failed */
		socket.io.on('reconnect_failed', () => {
			console.info('Reconnection failure');
			alert('We are anable to connect you to the web socket');
		});

	};

	const SendHandshake = () => {
		// console.log(SocketState.socket?.connect);
		console.info('Sending handshake to server...');
		socket.emit('handshake', () => {
			console.log('User handshake message received');
			setLoading(false);
			// console.log('la', SocketState.socket);
		});

	};

	if (loading) return <p>Loading Socket IO........</p>;

	return <SocketContextProvider value={{ SocketState, SocketDispatch, socket }}>{children}</SocketContextProvider>;
}

export default SocketContextComponent;
