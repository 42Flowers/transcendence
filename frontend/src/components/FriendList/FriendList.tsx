import './FriendList.css';
import FriendItem from '../FriendItem/FriendItem';
import { useCallback, useEffect, useState } from 'react';
import MainButton from '../MainButton/MainButton';

const FriendList: React.FC = () => {
	const [friendList, setFriendList] = useState(null);
	const userId = 48;
	
	// useEffect(() => {
		// 	fetch(`http://localhost:3000/api/friends/${userId}`)
		// 		.then(response => response.json)
		// 		.then( data => {
			// 			setFriendList(data);
			// 		})
			// }, [])
			
			useEffect(() => {
				const fetchData = async () => {
					const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
				const data = await response.json();
				console.log(data);
				setFriendList(data);
		};
		fetchData();
	}, []); 
	
	
	
	const friendsWithStatus0 = friendList ? friendList.filter(friend => friend.status === 0) : [];
	const friendsWithStatus1 = friendList ? friendList.filter(friend => friend.status === 1) : [];
	const friendsWithStatus2 = friendList ? friendList.filter(friend => friend.status === 2) : [];
	const friendsWithStatus3 = friendList ? friendList.filter(friend => friend.status === 3) : [];
	// const friendsWithStatus0 = friendList.filter(friend => friend.status === 0);
	// const friendsWithStatus1 = friendList.filter(friend => friend.status === 1);
	// const friendsWithStatus2 = friendList.filter(friend => friend.status === 2);
	// const friendsWithStatus3 = friendList.filter(friend => friend.status === 3);
	// if (friendList)
	// {
		// <FriendItem friendName={friendList[0]?.friends[0]?.friend?.pseudo} status={friendList[0]?.friends[0]?.status}/>
	// ))

	const SENDER = 0;
	const RECEIVER = 1;
	const FRIENDS = 2;
	const BLOCKED = 3;

	const [mode, setMode] = useState(FRIENDS);

	const handleClick = useCallback((newMode: number) => {
		setMode(newMode);
	}, []);

		if (mode == 1)
		{
			return (
			<div className="FriendList-wrapper">
				<div className="box-change">
					<div className='choice-button' onClick={() => handleClick(FRIENDS)}>Friends</div>
					<div className='choice-button' onClick={() => handleClick(SENDER)}>Friendship received</div>
					<div className='choice-button' onClick={() => handleClick(RECEIVER)}>Friendship sent</div>
					<div className='choice-button' onClick={() => handleClick(BLOCKED)}>Blocked friends</div>
				</div>
				<div className="box">
					<h2>Friendship received</h2>
						{
							friendList && Array.prototype.map.call(friendsWithStatus1 || [], ({ status, friend: { id, pseudo } }) => (
							<FriendItem key={id} friendName={pseudo} status={status} />
							))
						}
				</div>
			</div>
			);
		}

		else if (mode == 0)
		{
			return (
				<div className="FriendList-wrapper">
					<div className="box-change">
						<div className='choice-button' onClick={() => handleClick(FRIENDS)}>Friends</div>
						<div className='choice-button' onClick={() => handleClick(SENDER)}>Friendship received</div>
						<div className='choice-button' onClick={() => handleClick(RECEIVER)}>Friendship sent</div>
						<div className='choice-button' onClick={() => handleClick(BLOCKED)}>Blocked friends</div>
					</div>
					<div className="box">
						<h2>Friendship sent</h2>
							{
								friendList && Array.prototype.map.call(friendsWithStatus0 || [], ({ status, friend: { id, pseudo } }) => (
								<FriendItem key={id} friendName={pseudo} status={status} />
								))
							}
					</div>
				</div>
			);
		}

		else if (mode == 3)
		{
			return (
				<div className="FriendList-wrapper">
					<div className="box-change">
						<div className='choice-button' onClick={() => handleClick(FRIENDS)}>Friends</div>
						<div className='choice-button' onClick={() => handleClick(SENDER)}>Friendship received</div>
						<div className='choice-button' onClick={() => handleClick(RECEIVER)}>Friendship sent</div>
						<div className='choice-button' onClick={() => handleClick(BLOCKED)}>Blocked friends</div>
					</div>
					<div className="box">
						<h2>Blocked friends</h2>
							{
								friendList && Array.prototype.map.call(friendsWithStatus3 || [], ({ status, friend: { id, pseudo } }) => (
								<FriendItem key={id} friendName={pseudo} status={status} />
								))
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
						{/* <MainButton buttonName='Friends' />
						<MainButton buttonName='Friendship received' />
						<MainButton buttonName='Friendship sent' />
						<MainButton buttonName='Blocked friends' /> */}
						{/* <MainButton onClick={() => handleClick(PLAY_MODE)}>lol</MainButton> */}
						<div className='choice-button' onClick={() => handleClick(FRIENDS)}>Friends</div>
						<div className='choice-button' onClick={() => handleClick(SENDER)}>Friendship received</div>
						<div className='choice-button' onClick={() => handleClick(RECEIVER)}>Friendship sent</div>
						<div className='choice-button' onClick={() => handleClick(BLOCKED)}>Blocked friends</div>
					</div>
					<div className="box">
						<h2>Friends</h2>
							{/* {
								Array.prototype.map.call(friendList || [], ({ status, friend: { id, pseudo } }) => (
									<FriendItem key={id} friendName={pseudo} status={status} />
								))
							} */}
							{
								friendList && Array.prototype.map.call(friendsWithStatus2 || [], ({ status, friend: { id, pseudo } }) => (
								<FriendItem key={id} friendName={pseudo} status={status} />
								))
							}
					</div>
				</div>
				);
			}
};
export default FriendList;


// return (
// 	<div className="FriendList-wrapper">
// 		<div className="box-change">
// 			{/* <MainButton buttonName='Friends' />
// 			<MainButton buttonName='Friendship received' />
// 			<MainButton buttonName='Friendship sent' />
// 			<MainButton buttonName='Blocked friends' /> */}
// 			{/* <MainButton onClick={() => handleClick(PLAY_MODE)}>lol</MainButton> */}
// 			<div onClick={() => handleClick(FRIENDS)}>Friends</div>
// 			<div onClick={() => handleClick(SENDER)}>Friendship received</div>
// 			<div onClick={() => handleClick(RECEIVER)}>Friendship sent</div>
// 			<div onClick={() => handleClick(BLOCKED)}>Blocked friends</div>
// 		</div>
// 		<div className="box">
// 			<h2>Friends</h2>
// 				{/* {
// 					Array.prototype.map.call(friendList || [], ({ status, friend: { id, pseudo } }) => (
// 						<FriendItem key={id} friendName={pseudo} status={status} />
// 					))
// 				} */}
// 				{
// 					friendList && Array.prototype.map.call(friendsWithStatus2 || [], ({ status, friend: { id, pseudo } }) => (
// 					<FriendItem key={id} friendName={pseudo} status={status} />
// 					))
// 				}
// 		</div>
// 		<div className="box">
// 			<h2>Friendship received</h2>
// 				{
// 					friendList && Array.prototype.map.call(friendsWithStatus1 || [], ({ status, friend: { id, pseudo } }) => (
// 					<FriendItem key={id} friendName={pseudo} status={status} />
// 					))
// 				}
// 		</div>
// 		<div className="box">
// 			<h2>Friendship sent</h2>
// 				{
// 					friendList && Array.prototype.map.call(friendsWithStatus0 || [], ({ status, friend: { id, pseudo } }) => (
// 					<FriendItem key={id} friendName={pseudo} status={status} />
// 					))
// 				}
// 		</div>
// 		<div className="box">
// 			<h2>Blocked friends</h2>
// 				{
// 					friendList && Array.prototype.map.call(friendsWithStatus3 || [], ({ status, friend: { id, pseudo } }) => (
// 					<FriendItem key={id} friendName={pseudo} status={status} />
// 					))
// 				}
// 		</div>
// 	</div>
// );


/*return (
		<div className="FriendList-wrapper">
			<div className="box">
				<h2>Friends</h2>
					{
						Array.prototype.map.call(friendList || [], ({ status, friend: { id, pseudo } }) => (
							<FriendItem key={id} friendName={pseudo} status={status} />
						))
					}

					// <FriendItem friendName={friendList.userId}/> 
					// <FriendItem friendName={friendList[0]?.pseudo} status={friendList[0]?.status}/>

					// {friendList?.friends.map((friendship) => (
					// <FriendItem 
					// 	friendName={friendship.friend.pseudo} 
					// 	status={friendship.status}
					// />
					// ))}

					// <FriendItem friendName='Maximilien'status={2}/>
					// <FriendItem friendName='Yvan'status={2}/>
					// <FriendItem friendName='Alexis'status={2}/>
					// <FriendItem friendName='Heloise'status={0}/>
					// <FriendItem friendName='Charline'status={2}/>
					// <FriendItem friendName='Extra'status={1}/>
					// <FriendItem friendName='Choco'status={2}/>
					// <FriendItem friendName='Cookies'status={3}/>
					// <FriendItem friendName='Enormimouuuuuuus' status={0}/>
					</div>
					<div className="box">
						<h2>Friendship received</h2>
							{
								Array.prototype.map.call(friendList || [], ({ status, friend: { id, pseudo } }) => (
									<FriendItem key={id} friendName={pseudo} status={status} />
									))
								}
					</div>
					<div className="box">
						<h2>Friendship sent</h2>
							{
								Array.prototype.map.call(friendList || [], ({ status, friend: { id, pseudo } }) => (
									<FriendItem key={id} friendName={pseudo} status={status} />
									))
								}
					</div>
					<div className="box">
						<h2>Blocked friends</h2>
							{
								Array.prototype.map.call(friendList || [], ({ status, friend: { id, pseudo } }) => (
									<FriendItem key={id} friendName={pseudo} status={status} />
									))
								}
					</div>
				</div>
			);
			// }
		};
		export default FriendList;*/


// const FriendList: React.FC = () => {

// 	return (
// 		<div className="FriendList-wrapper">
// 			<div className="box">
// 				<h2>Friends</h2>
// 					<FriendItem friendName='Maximilien'/>
// 					<FriendItem friendName='Yvan'/>
// 					<FriendItem friendName='Alexis'/>
// 					<FriendItem friendName='Heloise'/>
// 					<FriendItem friendName='Charline'/>
// 					<FriendItem friendName='Extra'/>
// 					<FriendItem friendName='Choco'/>
// 					<FriendItem friendName='Cookies'/>
// 					<FriendItem friendName='Enormimouuuuuuus'/>
// 			</div>
// 		</div>
// 	);
// };

// export default FriendList;