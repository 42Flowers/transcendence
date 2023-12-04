import React, { useCallback, useState } from 'react';
import ChatChannels from './Channels/ChatChannels';
import ChatConv from './Conv/ChatConv';
import ChatPrivMessages from './PrivMessages/ChatPrivMessages';
import './Chat.css';
import { getConversations } from '../../api';
import { useQuery } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';

interface convMessage {
	authorName: string,
	authorId: number,
	creationTime: Date,
	content: string,
}

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
	const [selectedConv, setSelectedConv] = useState< convElem | null>(null);
	const auth = useAuthContext();

	console.log('User ID: %s', auth.user!.id);

	const convs = useQuery('get-convs', getConversations);

	let channels: convElem[] = [];
	let privateMessages: convElem[] = [];

	if (convs.isFetched) {
		for (let i = 0; i < convs.data.length; ++i) {
			if (convs.data[i].isChannel)
				channels.push(convs.data[i]);
			else {
				privateMessages.push(convs.data[i]);
			}
		}
	}

	const handleClickConv = useCallback((conv: convElem | null) => {
		setSelectedConv(conv);
	}, []);

	return (
		<div className='chat-wrapper' >
			{convs.isFetched && <ChatChannels channels={ channels } handleClickConv={ handleClickConv } />}
			{selectedConv && <ChatConv conversation={ selectedConv } />}
			{convs.isFetched && <ChatPrivMessages privMessages={ privateMessages } handleClickConv={ handleClickConv } />}
		</div>
	)
}

export default Chat;
