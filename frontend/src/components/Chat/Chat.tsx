import React, { useCallback, useEffect, useState } from 'react';
import ChatChannels from './Channels/ChatChannels';
import ChatConv from './Conv/ChatConv';
import ChatPrivMessages from './PrivMessages/ChatPrivMessages';
import './Chat.css';

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
	permissionMask?: number,
	messages: convMessage[],
}

const Chat: React.FC = () => {
	const [channels, setChannels] = useState<channelElem[]>([]);
	const [privMessages, setPrivMessages] = useState<privMessageElem[]>([]);
	const [selectedConv, setSelectedConv] = useState< convElem | null>(null);

	const userId = 1;

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
			const data = await response.json();
			console.log("get channels: ", data);
			setChannels(data);
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
			const data = await response.json();
			console.log("get priv-messages: ", data);
			setPrivMessages(data);
		};
		fetchData();
	}, [])

	const handleClickConv = useCallback((conv: channelElem | privMessageElem | null) => {
		if (!conv)
			return;
		if ("userPermissionMask" in conv) {
			const fetchData = async () => {
				const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
				const data = await response.json();
				setSelectedConv({
					isChannel: true,
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
					messages: data,
				});
			};
			fetchData();
		}
	}, []);

	return (
		<div className='chat-wrapper' >
			<ChatChannels channels={ channels } handleClickConv={handleClickConv} />
			{/* <ChatConv conv={ selectedConv } permissions={  } /> */}
			<ChatConv />
            <ChatPrivMessages privMessages={ privMessages } handleClickConv={handleClickConv} />
		</div>
	)
}

export default Chat;
