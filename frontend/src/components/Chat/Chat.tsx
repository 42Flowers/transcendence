import React, { useCallback, useState } from 'react';
import ChatChannels from './Channels/ChatChannels';
import ChatConv from './Conv/ChatConv';
import ChatPrivMessages from './PrivMessages/ChatPrivMessages';
import './Chat.scss';
import { ChannelMessage, fetchChannels, getConversations } from '../../api';
import { useQuery } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSocket } from '../Socket/Hooks/useSocket';
import { useGatewayEvent } from '../../hooks/gateway';
import { queryClient } from '../../query-client';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import { insertMessage } from './chat-system';

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

/**
 * The payload of the 'channel.message' event received from the gateway,
 * here we include to channelId to notify other channels than the currently selected.
 */
interface ChannelMessageEventPayload extends ChannelMessage {
	channelId: number;
}

const Chat: React.FC = () => {
	const channelsQuery = useQuery('channels', fetchChannels);

	useGatewayEvent<ChannelMessageEventPayload>('channel.message', ({ channelId, ...payload }) => {
		insertMessage(channelId, payload);
	});

	const [selectedConv, setSelectedConv] = useState<convElem | null>(null);
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
