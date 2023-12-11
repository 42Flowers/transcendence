import { useEffect, useRef } from "react";
import {io, ManagerOptions, SocketOptions, Socket } from 'socket.io-client';

export const useSocket = (
	uri: string,
	opts?: Partial<ManagerOptions & SocketOptions>
	): Socket  => {

	const options: typeof opts = {
		...(opts ?? {}),
		auth(cb) {
			cb({ token: localStorage.getItem('token') });
		},
	}

	const {current: socket} = useRef(io(uri, options));
	useEffect(() => {
		return () => {
			if (socket) socket.close();
		};
	}, [socket]);
	
	return socket;
}
