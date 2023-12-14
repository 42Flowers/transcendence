import React from 'react';
import { Socket } from 'socket.io-client';

interface ISocketContext {
	socket?: Socket;
};

export const SocketContext = React.createContext<ISocketContext>({});

/**
 * Listens to an event and calls cb upon receiving
 * @param ev The event to listen to
 * @param cb The callback function called when an event arrives, data contains the event payload sent from the backend.
 */
export function useSocketEvent<T = any>(ev: string, cb: (data: T) => void, deps: React.DependencyList = []) {
	const { socket } = React.useContext(SocketContext);

	React.useEffect(() => {
		if (socket) {
			socket.on(ev, cb);

			return () => {
				socket.off(ev, cb);
			}
		}
	}, [ socket, cb, ...deps ]);
}

export const SocketContextConsumer = SocketContext.Consumer;
export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;