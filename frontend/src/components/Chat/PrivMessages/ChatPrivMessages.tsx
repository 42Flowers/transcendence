import "./ChatPrivMessages.css";
import { useState } from "react";

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
	let listPrivMessages = privMessages.map((pm) =>
		<li key={ pm.targetId }>
			<button className="priv-messages-button" onClick={() => handleClickConv(pm)}>{ pm.targetName }</button>
		</li>
	);

	return (
		<ul className="display-priv-messages" >
			{ listPrivMessages }
		</ul>
	);
}

const ChatPrivMessages: React.FC<privMessageProps> = ({ privMessages, handleClickConv }) => {

	return (
		<div className="chat-priv-messages">
			<div className='title'>
				<h3>Private Messages</h3>
			</div>
			{privMessages && <DisplayPrivMessages privMessages={privMessages} handleClickConv={handleClickConv} />}
			{!privMessages && <DisplayPrivMessages privMessages={[]} handleClickConv={handleClickConv} />}
			<AddPrivMessage />
		</div>
	);
}

export default ChatPrivMessages;
