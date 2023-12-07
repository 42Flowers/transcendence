import React, { useState, useEffect } from 'react';
import './ChatConv.scss';
// import { AiOutlineSend } from 'react-icons/ai';
// import { GiPingPongBat } from 'react-icons/gi';
// import { HiOutlineUserCircle } from "react-icons/hi2";
import AvatarOthers from '../../AvatarOthers/AvatarOthers';
import { useAuthContext } from '../../../contexts/AuthContext';

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

interface displayConvProps {
	messages: convMessage[],
}

const DisplayConv: React.FC<displayConvProps> = ({ messages }) => {
	const auth = useAuthContext();

	let listMessages = messages.map((msg) =>
			<li key={msg.creationTime.getTime()} className='conv'>
				<p>{msg.content}</p>
			</li>
	);

	return (
		<div className='chat-container'>
			<ul className='chat-box'>
				{ listMessages }
			</ul>
		</div>
	)
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
				{/* <GiPingPongBat className="icon-button" /> */}
			</div>
			<div className="nav-item">
				{/* <HiOutlineUserCircle className="icon-button" /> */}
			</div>
			<div className="nav-item">
				<p className="icon-button">Block</p>
			</div>
		</div>
	)
}

const ChatConv: React.FC<convProps> = ({ conversation }) => {
	return (
		<div className="chat-msgs">
			<ConversationHeader title="Friend Name" />
			<DisplayConv messages={ [] } />
			<form className="chat-input">
				<input type="text" />
				<button type="submit">
					{/* <AiOutlineSend className="icon-send"/> */}
				</button>
			</form>
		</div>
	)
}

export default ChatConv;
