import React, { useState, useEffect } from 'react';
import './ChatConv.css';
import { AiOutlineSend } from 'react-icons/ai';
import { GiPingPongBat } from 'react-icons/gi';
import { HiOutlineUserCircle } from "react-icons/hi2";
import AvatarOthers from '../../AvatarOthers/AvatarOthers';

const CHAT: React.FC = () => {
	return (
		<div className='chat-container'>
			<div className='chat-box'>
				<div className='conv'>
					Hello
				</div>
				<div className='conv-user'>
					Hi
				</div>
				<div className='conv-user'>
					What about you?
				</div>
				<div className='conv'>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. 
				</div>
				<div className='conv'>
					Lorem ipsum dolor sit, amet consectetur adipisicing elit. Reprehenderit dolorum assumenda illo saepe expedita fugiat hic qui velit. In quo, quas voluptatibus dolor pariatur cum commodi harum dolores tenetur blanditiis?. 
				</div>
				<div className='conv'>
					And you?
				</div>
				<div className='conv-user'>
				Lorem ipsum phasmatos incendia 🔥, consectetur ada totam, assumenda.
				Lorem ipsum phasmatos incendia ❤️ , consectetur ada totam, assumenda totalejnf
				</div>
				<div className='conv-user'>
				Lorem ipsum phasmatos 🔥, consectetur ada totam, assumenda totalejnf
				Lorem ipsum phasmatos ❤️ , consectetur ada totam, assumenda totalejnf
				</div>
			</div>
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

const ChatConv: React.FC = () => {
	return (
		<div className='chat-msgs'>
			<div className='small-box'>
				<div className='nav-info'>
					<AvatarOthers status='Online'/>
				</div>
				<div className='nav-info'>
					Friend Name
				</div>
				<div className='nav-info'>
					11 win / 3 loose
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
			<CHAT/>
			<div className='small-box'>
				<ChatInput/>
				<AiOutlineSend className="icon-send"/>
			</div>
		</div>
	)
}

export default ChatConv;