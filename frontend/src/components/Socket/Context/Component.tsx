import React, { PropsWithChildren, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketContextProvider } from './Context';

const socket = io(import.meta.env.WEBSOCKET_URL, {
	reconnectionAttempts: 5,
	reconnectionDelay: 5000,
	autoConnect: false,
	auth(cb) {
		cb({ token: localStorage.getItem('token') });
	},
});

const SocketContextComponent: React.FC<PropsWithChildren> = ({ children }) => {
	const [ loading, setLoading ] = useState(true);

	useEffect(() => {
		/**Connect to the web socket */
		socket.connect()
		/**Start the event listeners */
		StartListeners();
		/**Send the handshake */
		socket.io.on('open', SendHandshake);

		// eslint-disable-next-line

		return () => {
			socket.io.off('open', SendHandshake);
			socket.disconnect();
		};
	}, [ socket ]);

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
		socket.emit('handshake', () => {
			setLoading(false);
		});
	};

	if (loading)
		return <p>Loading Socket IO........</p>;

	return (
		<SocketContextProvider value={{ socket }}>
			{children}
		</SocketContextProvider>
	);
}

export default SocketContextComponent;
