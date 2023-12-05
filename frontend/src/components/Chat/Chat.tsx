import React, { useCallback, useState } from 'react';
import ChatChannels from './Channels/ChatChannels';
import ChatConv from './Conv/ChatConv';
import ChatPrivMessages from './PrivMessages/ChatPrivMessages';
import './Chat.scss';
import { fetchChannels, getConversations } from '../../api';
import { useQuery } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSocket } from '../Socket/Hooks/useSocket';
import { useGatewayEvent } from '../../hooks/gateway';

interface convMessage {
	authorName: string,
	authorId: number,
	creationTime: Date,
	content: string,
}

interface Conversation {
	targetId: number;
	targetName: string;
}

interface Channel {
	channelId: number,
	channelName: string,
	targetId: number
	targetName: string,
	userPermissionMask: number,
}

type convElem2 = { isChannel: boolean; } & Partial<Conversation> & Partial<Channel>;

interface convElem {
	isChannel: boolean,
	channelId?: number,
	channelName?: string,
	targetId?: number
	targetName?: string,
	userPermissionMask?: number,
	messages: convMessage[],
}

function useSocketEvent(evt: string, cb: () => void) {
	const socket = useSocket('ws://localhost:3000');

	React.useEffect(() => {
		socket.on(evt, cb);

		return () => {
			socket.off(evt, cb);
		};
	}, [evt, cb]);
}

const Chat: React.FC = () => {
	const channelsQuery = useQuery('channels', fetchChannels);

	useGatewayEvent('lol', () => {
		console.log('lol received');
	});

	const [selectedConv, setSelectedConv] = useState< convElem | null>(null);
	const convs = useQuery('get-convs', getConversations);

	const privateMessages = React.useMemo(() => {
		if (convs.isFetched) {
			return (convs.data as convElem[]).filter(({ isChannel }) => !isChannel);
		}
		return [];
	}, [ convs ]);

	const handleClickConv = useCallback((conv: convElem | null) => {
		setSelectedConv(conv);
	}, []);

	return (
		<div className="chat-wrapper">
			<ChatChannels channels={channelsQuery.data || []} handleClickConv={ handleClickConv } />

			{selectedConv && <ChatConv conversation={selectedConv} />}
			
			<ChatPrivMessages privMessages={privateMessages} handleClickConv={ handleClickConv } />
		</div>
	);
}

export default Chat;
