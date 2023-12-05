import { useState } from "react";
import "./ChatPrivMessages.scss";

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

interface privMessageProps {
	privMessages: convElem[],
	handleClickConv: (conv: convElem | null) => void,
}

const AddPrivMessage: React.FC = () => {
	const [friendName, setFriendName] = useState<string>("");

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		// POST REQUEST to join channel
	};

	return (
		<form className="add-priv-messages" onSubmit={handleSubmit} >
			<input
				type="text"
				value={friendName}
				onChange={(event) => setFriendName(event.target.value)}
				placeholder="name"
			/>
			<button type="submit" >ADD</button>
		</form>
	)
}

const DisplayPrivMessages: React.FC<privMessageProps> = ({ privMessages, handleClickConv }) => {
	return (
		<ul className="display-priv-messages">
			{
				privMessages.map(pm => (
					<li key={pm.targetId}>
						<button className="priv-messages-button" onClick={() => handleClickConv(pm)}>
							{pm.targetName}
						</button>
					</li>
				))
			}
		</ul>
	);
}

const ChatPrivMessages: React.FC<privMessageProps> = ({ privMessages, handleClickConv }) => (
	<div className="chat-priv-messages">
		<div className="chat-header">
			<h3>Private Messages</h3>
		</div>
		<DisplayPrivMessages privMessages={privMessages} handleClickConv={handleClickConv} />
		<AddPrivMessage />
	</div>
);

export default ChatPrivMessages;
