import { Channel } from '../../../api';
import './ChatChannels.scss';
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
	channels: Channel[],
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

type ChannelListProps = {
	channels: Channel[];
	handleClickConv: (id: number) => void;
};

const ChannelList: React.FC<ChannelListProps> = ({ channels, handleClickConv }) => (
	<ul className="display-channels">
		{
			channels.map(({ id, name }) => (
				<li key={id}>
					<button className="channels-button">
						{name}
					</button>
				</li>
			))
		}
	</ul>
);

const ChatChannels: React.FC<channelsProp> = ({ channels, handleClickConv }) => {
	return (
		<div className="chat-channels">
			<div className="chat-header">
				<h3>Channels</h3>
			</div>
			<ChannelList channels={channels} handleClickConv={handleClickConv} />
			<AddChannel />
		</div>
	);
}

export default ChatChannels;
