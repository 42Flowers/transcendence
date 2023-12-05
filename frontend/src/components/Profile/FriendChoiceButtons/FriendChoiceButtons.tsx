import React, { useEffect, useState } from 'react';
import MainButton from '../../MainButton/MainButton';
import './FriendChoiceButtons.css';

const SENDER = 0;
const RECEIVER = 1;
const FRIENDS = 2;
const BLOCKED = 3;
//0 sender   /1 receiver  /2 accepted /3 blocked

interface FriendElem {
	status: number,
	friend: {
		id: number,
		pseudo: string,
	}
}

interface Props {
	userId: number;
	// isFriend: boolean;
	status: number;
	friendId: number;
	//handleUploadFriendChoiceButtons: (data: FriendElem | null) => void;
}

const FriendChoiceButtons: React.FC<Props> = ({userId, friendId, handleUploadFriendChoiceButtons}) => {
	const [buttonClicked, setButtonClicked] = useState(false);
	const [isFriend, setIsFriend] = useState< FriendElem | null>(null);
	const [isBlock, setIsBlock] = useState< FriendElem | null>(null);

	useEffect(() => {
		const fetchData = async () => {
		const response = await fetch(`http://localhost:3000/api/friends/${userId}/isFriendwith/${friendId}`);
		if (response.ok) {
		const text = await response.text();
		if (text) {
			const data = JSON.parse(text);
			setIsFriend(data);
		} else {
			setIsFriend(null);
		}
		} else {
			setIsFriend(null);
		}
	};
	fetchData();
	}, [buttonClicked, setButtonClicked]);


	useEffect(() => {
		const fetchData = async () => {
		const response = await fetch(`http://localhost:3000/api/friends/${userId}/isBlockWith/${friendId}`);
		if (response.ok) {
		const text = await response.text();
		if (text) {
			const data = JSON.parse(text);
			setIsBlock(data);
		} else {
			setIsBlock(null);
		}
		} else {
			setIsBlock(null);
		}
	};
	fetchData();
	}, [buttonClicked, setButtonClicked]);
 

	const handleAdd = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/add/${friendId}`, {
			method: 'POST',
		})
			.then(response => response.json())
			.then(data => {
				//handleUploadFriendChoiceButtons(data);
				setButtonClicked(prevState => !prevState);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	const handleBlock = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/block/${friendId}`, {
			method: 'POST',
		})
			.then(response => response.json())
			.then(data => {
				//handleUploadFriendChoiceButtons(data);
				setButtonClicked(prevState => !prevState);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	const handleUnblock = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/unblock/${friendId}`, {
			method: 'POST',
		})
			.then(response => response.json())
			.then(data => {
				//handleUploadFriendChoiceButtons(data);
				setButtonClicked(prevState => !prevState);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	// if (isFriend == false)
	if (!isFriend)
	{
		// if (isFriend.status == BLOCKED)
		if (isBlock)
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
						<MainButton buttonName='Add' onClick={() => handleAdd()} />
						<MainButton buttonName='Unblock' onClick={() => handleUnblock()} />
					</div>
				</div>
			);
		}
		else
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
						<MainButton buttonName='Add' onClick={() => handleAdd()} />
						<MainButton buttonName='Block' onClick={() => handleBlock()} />
					</div>
				</div>
			);
		}
	}
	// if (isFriend == true)
	else if (isFriend)
	{
		if (isBlock)
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
						<MainButton buttonName='Unblock' onClick={() => handleUnblock()} />
					</div>
				</div>
			);
		}
		else if (isFriend.status == FRIENDS)
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
						<MainButton buttonName='Block' onClick={() => handleBlock()} />
					</div>
				</div>
			);
		}
	}
};
		
		
export default FriendChoiceButtons;