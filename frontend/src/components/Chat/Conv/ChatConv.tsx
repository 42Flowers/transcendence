import React, { useState, useEffect } from 'react';
import './ChatConv.scss';
import { AiOutlineSend } from 'react-icons/ai';
import { GiPingPongBat } from 'react-icons/gi';
import { HiOutlineUserCircle } from "react-icons/hi2";
import AvatarOthers from '../../AvatarOthers/AvatarOthers';
import { useAuthContext } from '../../../contexts/AuthContext';
import { MessageView } from '../MessageView';
import { useMutation, useQuery } from 'react-query';
import { ChannelMessage, fetchChannelMessages, postChannelMessage } from '../../../api';
import { queryClient } from '../../../query-client';

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
	permissionMask?: number,
	messages: convMessage[],
}

interface convProps {
	conversation: convElem,
}


type ConversationHeaderProps = {
	title: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ title }) => {
	return (
		<div className="chat-header bg-inverted conv-header">
			<div className="nav-item">
				<AvatarOthers status="Online" />
			</div>
			<div className="nav-item">
				{title}
			</div>
			<div className="push-right nav-item">
				<GiPingPongBat className="icon-button" />
			</div>
			<div className="nav-item">
				<HiOutlineUserCircle className="icon-button" />
			</div>
			<div className="nav-item">
				<p className="icon-button">Block</p>
			</div>
		</div>
	)
}

type ChatInputProps = {
	onSend: (content: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
	const handleSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;
		const formData = new FormData(e.currentTarget);
		const content = formData.get('message')?.toString();

		if (!content || content.trim().length === 0)
			return ;
		
		form.reset();

		onSend(content);
	}, [ onSend ]);

	return (
		<form className="chat-input" onSubmit={handleSubmit}>
			<input type="text" name="message" />
			<button type="submit">
				<AiOutlineSend className="icon-send"/>
			</button>
		</form>
	);
};

const ChatConv: React.FC<convProps> = ({ conversation }) => {
	const messagesQueryKey = [ 'channel', 4, 'messages' ];

	const messagesQuery = useQuery(messagesQueryKey, () => fetchChannelMessages(4));
	const postMessageMutation = useMutation({
		mutationFn: (content: string) => postChannelMessage(4, content),
		onSuccess(data) {
			console.log('oooooo', data);
			queryClient.setQueryData<ChannelMessage[]>(messagesQueryKey, messages => ([
				...(messages ?? []),
				data,
			]));
		},
	});

	const handleSend = React.useCallback((content: string) => {
		postMessageMutation.mutate(content);
	}, []);

	return (
		<div className="chat-msgs">
			<ConversationHeader title="Friend Name" />
			<MessageView messages={ messagesQuery.data || [] } />
			<ChatInput onSend={handleSend} />
		</div>
	)
}

export default ChatConv;
