import React, { useCallback, useState } from 'react';
import ChatChannels from './Channels/ChatChannels';
import ChatConv from './Conv/ChatConv';
import ChatPrivMessages from './PrivMessages/ChatPrivMessages';
import './Chat.scss';
import { fetchChannels, getConversations } from '../../api';
import { useQuery } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';

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

const Chat: React.FC = () => {
	const channelsQuery = useQuery('channels', fetchChannels);

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
