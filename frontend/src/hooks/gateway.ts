import React from 'react';
import { io } from "socket.io-client";

/* TODO put this in the env file */
const GATEWAY_URL = 'ws://localhost:3000';

const gatewaySocket = io(GATEWAY_URL, {
    transports: [ 'websocket' ],
    extraHeaders: {
        'Authorization': localStorage.getItem('token') ?? '',
    },
    autoConnect: false,
});

let socketInitialized = false;

gatewaySocket.io.on('open', () => {
    gatewaySocket.emit('handshake', () => {
        console.log('Handshake received');
    });
});

// /**Reconnect Event */
// socket.io.on('reconnect', (attempt: number) => {
//     console.info('Reconnected on attempt: ', + attempt);
// });
// /**Reconnect attemp event */
// socket.io.on('reconnect_attempt', (attempt: number) => {
//     console.info('Reconnection attempt: ', + attempt );
// });

// /**Reconnection Error */
// socket.io.on('reconnect_error', (error) => {
//     console.info('Reconnection error: ', + error);
// });

// /**Reconnection failed */
// socket.io.on('reconnect_failed', () => {
//     console.info('Reconnection failure');
//     alert('We are anable to connect you to the web socket');
// });

export const useGateway = () => {
    React.useEffect(() => {
        if (!socketInitialized) {
            socketInitialized = true;
            gatewaySocket.connect();
        }
    }, []);

    return gatewaySocket;
};

export const useGatewayEvent = (ev: string, cb: () => void) => {
    const gateway = useGateway();
    
    React.useEffect(() => {
        gateway.on(ev, cb);

        return () => {
            gateway.off(ev, cb);
        }
    }, [ ev, cb ]);
};