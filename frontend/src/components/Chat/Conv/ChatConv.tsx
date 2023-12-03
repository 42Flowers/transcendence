import React, { useState, useEffect } from 'react';
import './ChatConv.css';
import { AiOutlineSend } from 'react-icons/ai';
import { GiPingPongBat } from 'react-icons/gi';
import { HiOutlineUserCircle } from "react-icons/hi2";
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

function ChatInput() {
 const [maxLength, setMaxLength] = useState(0);

	useEffect(() => {
	const inputElement = document.querySelector('.chat-input') as HTMLInputElement;
	const inputWidth = inputElement.offsetWidth;
	const newMaxLength = Math.round(inputWidth / 8);
	setMaxLength(newMaxLength);
	}, []);

	return (
	<input
		type="text"
		maxLength={maxLength}
		className='chat-input'
	/>
	);
}

const ConvFriend: React.FC = () => {
	return (
		<div className='small-box'>
			<div className='nav-info'>
				<AvatarOthers status='Online'/>
			</div>
			<div className='nav-info'>
				Friend Name
			</div>
			<div className='nav-info'>
				<GiPingPongBat className="icon-button"/>
			</div>
			<div className='nav-info'>
				<HiOutlineUserCircle className="icon-button"/>
			</div>
			<div className='nav-info'>
				<p className="icon-button">Block</p>
			</div>
		</div>
	)
}

const ChatConv: React.FC<convProps> = ({ conversation }) => {
	return (
		<div className='chat-msgs'>
			<ConvFriend />
			<DisplayConv messages={ conversation.messages } />
			<div className='small-box'>
				<ChatInput/>
				<AiOutlineSend className="icon-send"/>
			</div>
		</div>
	)
}

export default ChatConv;
