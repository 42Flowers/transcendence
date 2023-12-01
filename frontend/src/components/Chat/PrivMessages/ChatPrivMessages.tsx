import "./ChatPrivMessages.css";
import { useEffect, useState } from "react";

interface privMessageElem {
	targetId: number,
	targetName: string,
}

interface channelElem {
	channelId: number,
	channelName: string,
	userPermissionMask: number,
}

interface privMessageProps {
	privMessages: privMessageElem[],
	handleClickConv: (conv: channelElem | privMessageElem | null) => void,
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

const DisplayPrivMessages: React.FC<privMessageProps> = ({ privMessages }) => {
	let listFriends = privMessages.map((pm) =>
		<li key={ pm.targetId }>
			<button className="priv-messages-button">{ pm.targetName }</button>
		</li>
	);

	return (
		<ul className="display-priv-messages" >
			{ listFriends }
		</ul>
	);
}

const ChatPrivMessages: React.FC<privMessageProps> = ({ privMessages, handleClickConv }) => {

	return (
		<div className="chat-priv-messages">
			<div className='title'>
				<h3>Friends</h3>
			</div>
			{privMessages && <DisplayPrivMessages privMessages={privMessages} handleClickConv={handleClickConv} />}
			{!privMessages && <DisplayPrivMessages privMessages={[]} handleClickConv={handleClickConv} />}
			<AddPrivMessage />
		</div>
	);
}

export default ChatPrivMessages;
