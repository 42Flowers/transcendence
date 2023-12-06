import React, { useEffect, useState } from 'react';
import MainButton from '../../MainButton/MainButton';
import './FriendChoiceButtons.css';

interface Props {
	userId: number;
	friendId: number;
}

const FriendChoiceButtons: React.FC<Props> = ({userId, friendId}) => {
	const [ isBlocked, setIsBlocked ] = useState<boolean | null>(null);
	const [ isFriended, setIsFriended ] = useState<boolean | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`http://localhost:3000/api/profile/${userId}/isFriendwith/${friendId}`);
			if (response.ok) {
				const text = await response.text();
				if (text) {
					setIsFriended(true);
				} else {
					setIsFriended(false);
				}
			} else {
				setIsFriended(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`http://localhost:3000/api/profile/${userId}/isBlockWith/${friendId}`);
			if (response.ok) {
				const text = await response.text();
				if (text) {
					setIsBlocked(true);
				} else {
					setIsBlocked(false);
				}
			} else {
				setIsBlocked(false);
			}
		};
		fetchData();
	}, []);

	const handleAdd = () => {
		fetch(`http://localhost:3000/api/profile/${userId}/add/${friendId}`, {
			method: 'POST',
		})
			.then(response => response.json())
			.then(data => {
				setIsFriended(data);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	const handleBlock = () => {
		fetch(`http://localhost:3000/api/profile/${userId}/block/${friendId}`, {
			method: 'POST',
		})
			.then(response => response.json())
			.then(data => {
				setIsBlocked(true);

			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	const handleUnblock = () => {
		fetch(`http://localhost:3000/api/profile/${userId}/unblock/${friendId}`, {
			method: 'POST',
		})
			.then(response => response.json())
			.then(data => {
				setIsBlocked(false);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

	if (isFriended == false)
	{
		if (isBlocked)
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
						{/* <MainButton buttonName='Add' onClick={() => handleAdd()} /> */}
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
	else if (isFriended)
	{
		if (isBlocked)
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
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
						<MainButton buttonName='Block' onClick={() => handleBlock()} />
					</div>
				</div>
			);
		}
	}
};
		
		
export default FriendChoiceButtons;