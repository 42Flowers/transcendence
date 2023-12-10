import React, { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

export interface ISocketContextState {
	socket: Socket | undefined,
	uid: string,
	users: string[]
}

export const defaultSocketContextState :ISocketContextState = {
	socket: undefined,
	uid: '',
	users: []
};

export type TSocketContextActions = 'update_socket' | 'update_uid' | 'update_users' | 'remove_users';

export type TSocketContextPayload = string | string[] | Socket;

export interface ISocketContextActions {
	type: TSocketContextActions;
	payload: TSocketContextPayload
}

export const SocketReducer = (state: ISocketContextState, action: ISocketContextActions) => {
	console.log(`Message Received - Action: ${action.type} | Payload: ${action.payload}`);

	switch (action.type) {
		case 'update_socket':
			return {...state, socket: action.payload as Socket};
		case 'update_uid':
			return {...state, uid: action.payload as string};
		case 'update_users':
			return {...state, users: [...state.users, action.payload as string]};
		case 'remove_users':
			return {...state, users: state.users.filter((uid) => uid !== (action.payload as String))};
		default:
			return {...state};
	}
};

export interface ISocketContextProps {
	SocketState: ISocketContextState;
	SocketDispatch: React.Dispatch<ISocketContextActions>; 
}

const SocketContext = createContext<ISocketContextProps>({
	SocketState: defaultSocketContextState,
	SocketDispatch: () => {}
});

/**
 * Listens to an event and calls cb upon receiving
 * @param ev The event to listen to
 * @param cb The callback function called when an event arrives, data contains the event payload sent from the backend.
 */
export function useSocketEvent<T = any>(ev: string, cb: (data: T) => void) {
	const { SocketState: { socket } } = useContext(SocketContext);

	React.useEffect(() => {
		if (socket) {
			socket.on(ev, cb);

			return () => {
				socket.off(ev, cb);
			}
		}
	}, [ socket ]);
}

export const SocketContextConsumer = SocketContext.Consumer;
export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;