import React, { useCallback, useEffect, useState } from 'react';
import ChatChannels from './Channels/ChatChannels';
import ChatConv from './Conv/ChatConv';
import ChatPrivMessages from './PrivMessages/ChatPrivMessages';
import './Chat.css';
import { getPrivMessages } from '../../api';
import { useQuery } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';

interface channelElem {
	channelId: number,
	channelName: string,
	userPermissionMask: number,
}

interface privMessageElem {
	targetId: number,
	targetName: string,
}

interface convMessage {
	authorName: string,
	creationTime: Date,
	content: string,
}

interface convElem {
	isChannel: boolean,
	channelId?: number,
	channelName?: string,
	targetId?: number
	targetName?: string,
	permissionMask?: number,
	messages: convMessage[],
}

const Chat: React.FC = () => {
	const [channels, setChannels] = useState<channelElem[]>([]);
	const [selectedConv, setSelectedConv] = useState< convElem | null>(null);
	const auth = useAuthContext();

	console.log('User ID: %s', auth.user!.id);

	const userId = 1;

	const privateMessages = useQuery('priv_convs', getPrivMessages);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
			const data = await response.json();
			console.log("get channels: ", data);
			setChannels(data);
		};
		fetchData();
	}, []);


	const handleClickConv = useCallback((conv: channelElem | privMessageElem | null) => {
		if (!conv)
			return;
		if ("userPermissionMask" in conv) {
			const fetchData = async () => {
				const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
				const data = await response.json();
				setSelectedConv({
					isChannel: true,
					channelId: conv.channelId,
					channelName: conv.channelName,
					permissionMask: conv.userPermissionMask,
					messages: data,
				});
			};
			fetchData();
		}
		else if ("targetName" in conv) {
			const fetchData = async () => {
				const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
				const data = await response.json();
				setSelectedConv({
					isChannel: false,
					targetId: conv.targetId,
					targetName: conv.targetName,
					messages: data,
				});
			};
			fetchData();
		}
	}, []);

	return (
		<div className='chat-wrapper' >
			<ChatChannels channels={ channels } handleClickConv={ handleClickConv } />
			{/* <ChatConv conv={ selectedConv } permissions={  } /> */}
			{selectedConv && <ChatConv conversation={ selectedConv } />}
			{privateMessages.isFetched && <ChatPrivMessages privMessages={ privateMessages.data } handleClickConv={ handleClickConv } />}
		</div>
	)
}

export default Chat;
