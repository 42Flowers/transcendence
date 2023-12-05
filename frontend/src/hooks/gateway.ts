import React from 'react';
import { Socket, io } from "socket.io-client";

/* TODO put this in the env file */
const GATEWAY_URL = 'ws://localhost:3000';

let gatewaySocket: Socket | null = null;
let socketInitialized = false;

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
    if (!socketInitialized) {
        socketInitialized = true;

        gatewaySocket = io(GATEWAY_URL, {
            transports: [ 'websocket' ],
            withCredentials: true,
            autoConnect: false,
            auth(sendConnectPacket) {
                sendConnectPacket({
                    token: localStorage.getItem('token') ?? ''
                });
            }
        });

        gatewaySocket.io.on('open', () => {
            console.log('[Gateway] Connected, sending handshake');
            gatewaySocket!.emit('handshake', () => {
            console.log('[Gateway] Handshake received');
            });
        });

        console.log('[Gateway] Connecting');
        gatewaySocket.connect();
    }

    return gatewaySocket!;
};

export const useGatewayEvent = <T = any>(ev: string, cb: (payload: T) => void) => {
    const gateway = useGateway();
    
    React.useEffect(() => {
        gateway.on(ev, cb);

        return () => {
            gateway.off(ev, cb);
        }
    }, [ ev, cb ]);
};