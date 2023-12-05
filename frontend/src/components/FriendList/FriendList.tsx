import './FriendList.css';
import FriendItem from '../FriendItem/FriendItem';
import { useCallback, useEffect, useState } from 'react';

const SENDER_PAGE = 0;
const RECEIVER_PAGE = 1;
const FRIENDS_PAGE = 2;
const BLOCKED_PAGE = 3;

const SENDER = 0;
const RECEIVER = 1;
const FRIENDS = 2;
const BLOCKED = 3;

interface FriendElem {
	status: number,
	friend: {
		id: number,
		pseudo: string,
		avatar: string,
	}
}

const FriendList: React.FC = () => {
	const [friendList, setFriendList] = useState< FriendElem[] | null>(null);
	const userId = 1;
			
	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
			const data = await response.json();
			setFriendList(data);
		};
		fetchData();
	}, []); 

	const ParentRerender = (data: FriendElem[] | null) => {
		setFriendList(data);
	};
	
	const friendsListSender = friendList ? friendList.filter(friend => friend.status === SENDER) : [];
	const friendsListReceiver = friendList ? friendList.filter(friend => friend.status === RECEIVER) : [];
	const friendsListFriends = friendList ? friendList.filter(friend => friend.status === FRIENDS) : [];
	const friendsListBlocked = friendList ? friendList.filter(friend => friend.status === BLOCKED) : [];

	const [mode, setMode] = useState(FRIENDS_PAGE);

	const handleClick = useCallback((newMode: number) => {
		setMode(newMode);
	}, []);

		if (mode == RECEIVER_PAGE)
		{
			return (
			<div className="FriendList-wrapper">
				<div className="box-change">
					<div className='choice-button' onClick={() => handleClick(FRIENDS_PAGE)}>Friends</div>
					<div className='choice-button' onClick={() => handleClick(RECEIVER_PAGE)}>Friendship received</div>
					<div className='choice-button' onClick={() => handleClick(SENDER_PAGE)}>Friendship sent</div>
					<div className='choice-button' onClick={() => handleClick(BLOCKED_PAGE)}>Blocked friends</div>
				</div>
				<div className="box">
					<h2>Friendship received</h2>
					{
						friendList && Array.prototype.map.call(friendsListReceiver || [], ({ status, friend: { id, pseudo, avatar } }) => (
							<FriendItem key={id} userId={userId} avatar={avatar} friendName={pseudo} status={status} friendId={id} parentRerender={ParentRerender} />
						)) as React.ReactNode[]
					}
				</div>
			</div>
			);
		}

		else if (mode == SENDER_PAGE)
		{
			return (
				<div className="FriendList-wrapper">
					<div className="box-change">
						<div className='choice-button' onClick={() => handleClick(FRIENDS_PAGE)}>Friends</div>
						<div className='choice-button' onClick={() => handleClick(RECEIVER_PAGE)}>Friendship received</div>
						<div className='choice-button' onClick={() => handleClick(SENDER_PAGE)}>Friendship sent</div>
						<div className='choice-button' onClick={() => handleClick(BLOCKED_PAGE)}>Blocked friends</div>
					</div>
					<div className="box">
						<h2>Friendship sent</h2>
						{
							friendList && Array.prototype.map.call(friendsListSender || [], ({ status, friend: { id, pseudo } }) => (
							<FriendItem key={id} userId={userId} friendName={pseudo} status={status} friendId={id} parentRerender={ParentRerender} />
							)) as React.ReactNode[]
						}
					</div>
				</div>
			);
		}

		else if (mode == BLOCKED_PAGE)
		{
			return (
				<div className="FriendList-wrapper">
					<div className="box-change">
						<div className='choice-button' onClick={() => handleClick(FRIENDS_PAGE)}>Friends</div>
						<div className='choice-button' onClick={() => handleClick(RECEIVER_PAGE)}>Friendship received</div>
						<div className='choice-button' onClick={() => handleClick(SENDER_PAGE)}>Friendship sent</div>
						<div className='choice-button' onClick={() => handleClick(BLOCKED_PAGE)}>Blocked friends</div>
					</div>
					<div className="box">
						<h2>Blocked friends</h2>
						{
							friendList && Array.prototype.map.call(friendsListBlocked || [], ({ status, friend: { id, pseudo } }) => (
							<FriendItem key={id} userId={userId} friendName={pseudo} status={status} friendId={id} parentRerender={ParentRerender} />
							)) as React.ReactNode[]
						}
					</div>
				</div>
			);
		}

		else
		{
			return (
				<div className="FriendList-wrapper">
					<div className="box-change">
						<div className='choice-button' onClick={() => handleClick(FRIENDS_PAGE)}>Friends</div>
						<div className='choice-button' onClick={() => handleClick(RECEIVER_PAGE)}>Friendship received</div>
						<div className='choice-button' onClick={() => handleClick(SENDER_PAGE)}>Friendship sent</div>
						<div className='choice-button' onClick={() => handleClick(BLOCKED_PAGE)}>Blocked friends</div>
					</div>
					<div className="box">
						<h2>Friends</h2>
						{
							friendList && Array.prototype.map.call(friendsListFriends || [], ({ status, friend: { id, pseudo } }) => (
							<FriendItem key={id} userId={userId} friendName={pseudo} status={status} friendId={id} parentRerender={ParentRerender} />
							)) as React.ReactNode[]
						}
					</div>
				</div>
				);
			}
};
export default FriendList;
