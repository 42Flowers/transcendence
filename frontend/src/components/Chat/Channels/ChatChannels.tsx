import './ChatChannels.css';
import React, { useState } from 'react';

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

interface channelsProp {
	channels: convElem[],
	handleClickConv: (conv: convElem | null) => void,
}

const AddChannel: React.FC = () => {
	const [chanName, setChanName] = useState<string>("");
	const [chanPwd, setChanPwd] = useState<string>("");

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		// Post to join a channel
	};

	return (
		<form className="add-channel" onSubmit={handleSubmit} >
			<input 
				type="text"
				value={chanName}
				onChange={(event) => setChanName(event.target.value)}
				placeholder="name"
			/>
			<input
				type="text" 
				value={chanPwd} 
				onChange={(event) => setChanPwd(event.target.value)}
				placeholder="password"
			/>
			<button type="submit" >ADD</button>
			{/* <input type="checkbox" className="check"></input> */}
			{/* <div>
				<button type="submit" >ADD</button>
				<input type="checkbox" id="check" className="scales" />
				<label htmlFor="check">Create</label>
			</div> */}
		</form>
	)
}

const DisplayChannels: React.FC<channelsProp> = ({ channels, handleClickConv }) => {
	let listChannels = channels.map((channel) => 
		<li key={ channel.channelId }>
			<button className='channels-button' onClick={() => handleClickConv(channel)}>{ channel.channelName }</button>
		</li>
	);

	return (
		<ul className="display-channels" >
			{ listChannels }
		</ul>
	)
}

const ChatChannels: React.FC<channelsProp> = ({ channels, handleClickConv }) => {

	return (
		<div className='chat-channels' >
			<div className='title'>
				<h3>Channels</h3>
			</div>
			{channels && <DisplayChannels channels={channels} handleClickConv={handleClickConv} />}
			{!channels && <DisplayChannels channels={[]} handleClickConv={handleClickConv} />}
			<AddChannel />
		</div>
	);
}

export default ChatChannels;
