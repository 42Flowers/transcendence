import './FriendItem.css';
import MainButton from '../MainButton/MainButton'
import AvatarOthers from '../AvatarOthers/AvatarOthers';
import default_avatar from '../../assets/images/default_avatar.png'
import { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchAvailableUsers } from '../../api';
import { UserAvatar } from '../UserAvatar';

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
	friendName: string;
	status: number;
	avatar: string;
	friendId: number;
	parentRerender: (data: FriendElem[] | null) => void;
}

const FriendItem: React.FC<Props> = ({userId, avatar, friendName, status, friendId, parentRerender}) => {

	const handleUnblock = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/unblock/${friendId}`, {
			method: 'POST',
		})
		.then(response => response.json())
		.then(data => parentRerender(data))
		.catch((error) => {
			console.error('Error:', error);
		});
	}

	const handleBlock = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/block/${friendId}`, {
			method: 'POST',
		})
		.then(response => response.json())
		.then(data => parentRerender(data))
		.catch((error) => {
			console.error('Error:', error);
		});
	}

	const handleDelete = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/delete/${friendId}`, {
			method: 'POST',
		})
		.then(response => response.json())
		.then(data => parentRerender(data))
		.catch((error) => {
			console.error('Error:', error);
		});
	}

	const handleCancel = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/cancel/${friendId}`, {
			method: 'POST',
		})
		.then(response => response.json())
		.then(data => parentRerender(data))
		.catch((error) => {
			console.error('Error:', error);
		});
	}


	// const handleAccept = () => {
	// 	fetch(`http://localhost:3000/api/friends/${userId}/accept/${friendId}`, {
	// 		method: 'POST',
	// 	})
	// 	.then(response => response.json())
	// 	.then(data => parentRerender(data))
	// 	.catch((error) => {
	// 		console.error('Error:', error);
	// 	});
	// }
	const handleAccept = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/accept/${friendId}`, {
			method: 'POST',
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(data => {
			if (data) {
				return JSON.parse(data);
			} else {
				return {};
			}
		})
		.then(data => parentRerender(data))
		.catch((error) => {
			console.error('Error:', error);
		});
	}
	

	const handleDecline = () => {
		fetch(`http://localhost:3000/api/friends/${userId}/decline/${friendId}`, {
			method: 'POST',
		})
		.then(response => response.json())
		.then(data => parentRerender(data))
		.catch((error) => {
			console.error('Error:', error);
		});
	}

    if(status === FRIENDS)
	{
		return (
			<div className="FriendItem-wrapper">
				<div className="box-popup">
					<div className="input-box">
						<UserAvatar
							avatar={avatar}
							userId={friendId} />
						<p>{friendName}</p>
					</div>
					<div className='buttons'>
							<MainButton buttonName='Play' />
							{/* <MainButton buttonName='MSG' /> */}
							<MainButton buttonName='Block' onClick={() => handleBlock()} />
							<MainButton buttonName='Delete' onClick={() => handleDelete()} />
					</div>
				</div>
			</div>
		);
	}
	if(status === BLOCKED)
	{
		return (
			<div className="FriendItem-wrapper">
				<div className="box-popup">
					<div className="input-box">
					{ 
							avatar ?
								<AvatarOthers status={availability} avatar={`http://localhost:3000/static/${avatar}`} userId={friendId} />
							:
								<AvatarOthers status={availability} avatar={default_avatar} userId={friendId} />
						}
						<p>{friendName}</p>
					</div>
					<div className='buttons'>
						<MainButton buttonName='Unblock' onClick={() => handleUnblock()} />
						{/* <MainButton buttonName='Delete' onClick={() => handleDelete()} /> */}
					</div>
				</div>
			</div>
		);
	}
	if(status === SENDER)
	{
		return (
			<div className="FriendItem-wrapper">
				<div className="box-popup">
					<div className="input-box">
						{ 
							avatar ?
								<AvatarOthers status={availability} avatar={`http://localhost:3000/static/${avatar}`} userId={friendId} />
							:
								<AvatarOthers status={availability} avatar={default_avatar} userId={friendId} />
						}
						<p>{friendName}</p>
					</div>
					<div className='buttons'>
						<MainButton buttonName='Cancel' onClick={() => handleCancel()} />
					</div>
				</div>
			</div>
		);
	}
	if(status === RECEIVER)
	{
		return (
			<div className="FriendItem-wrapper">
				<div className="box-popup">
					<div className="input-box">
						{ 
							avatar ?
								<AvatarOthers status={availability} avatar={`http://localhost:3000/static/${avatar}`} userId={friendId} />
							:
								<AvatarOthers status={availability} avatar={default_avatar} userId={friendId} />
						}
						<p>{friendName}</p>
					</div>
					<div className='buttons'>
						<MainButton buttonName='Accept' onClick={() => handleAccept()} />
						<MainButton buttonName='Decline'onClick={() => handleDecline()}  />
					</div>
				</div>
			</div>
		);
	}
};

export default FriendItem;