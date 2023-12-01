import { useContext, useEffect, useState } from "react";
// import { Socket } from "socket.io-client";
import SocketContext from "../Socket/Context/Context";
import FriendsRequest from "./FriendsRequest";
import Messages from "./PrivMessages";
import Rooms from "./Rooms";
import UsersConnectedComponent from "./UsersConnectedComponent";
import './chat.css';
import GroupChat from "./GroupChat";


function ChatComponent() {
	const { SocketState } = useContext(SocketContext);
	const [message, setMessage] = useState('');
	const [userId, setUserId] = useState('');
	const [dest, setDest] = useState('');
	const [from, setFrom] = useState('');
	const [msgType, setmsgType] = useState('');
	const [messages, setMessages] = useState<string[]>([]);
	const [selected, setSelected] = useState(''); 

	// const getUsers = async () => {
	// 	await fetch('http://locahost:3333', {method: 'GET', })
	// }


	const setName = () => {
		SocketState.uid = userId;
		if (SocketState.socket) {
			SocketState.socket.emit('user', SocketState.uid);
			console.log("socket existe");
		}
		setUserId('');
	}
  
	const sendMessage = () => {
		console.log("sympathique");
		console.log('passe');
		console.log(SocketState.socket);
		SocketState.socket?.emit('message', {type: msgType, to: dest, message: message, options: ''});
		setDest('');
		setMessage('');
	};

	useEffect(() => {
	  if (SocketState.socket) {
		SocketState.socket.on('message', (receivedMessage) => {
		  console.log('Received message:', receivedMessage.message);
		});
		SocketState.socket.on('error', (data: {errmsg: string}) => {
			alert(data.errmsg);
		})
	  }
	  // eslint-disable-next-line
	}, [SocketState.socket]);

	const messageListener = (data : {from: string, to: string, message: string}) => {
			console.log('trop géniale youhou');
			console.log(data.from);
			setFrom(data.from);
			if (data.to !== SocketState.uid)
				console.log("ca s'envoie alors surement à un groupe");
			setMessages([...messages, data.message])
	};

		useEffect(() => {
		if (SocketState.socket)
			SocketState.socket?.on('message', messageListener);
		return () => {
			SocketState.socket?.off('message', messageListener);
		}
		// eslint-disable-next-line
	}, [messageListener])


	useEffect(() => {
		SocketState.socket?.on('cleaned', () => {
			console.log('cleaned');
		})
	}, [SocketState.socket]);

  
	return (
	  <div className='chatcomponent'>
		<div className='sidebar'>
			<button onClick={() => {
				SocketState.socket?.emit('reset', 'all');
			}}>Reset all</button> 
			<div className='module'>
				<input
					type="text"
					placeholder="type your name"
					value={userId}
					onChange={(e) => setUserId(e.target.value)}
				/>
				<button onClick={setName}>Submit</button>
			</div>
			<div className='module'>
			<input type='radio'
				id='priv'
				value={msgType}
				name='messageType'
				onChange={() => setmsgType('priv')}/>
				<label htmlFor="priv">Private Message</label><br></br>
				<input type='radio'
				id='room'
				value={msgType}
				name='messageType'
				onChange={() => setmsgType('room')}/>
				<label htmlFor="room">Room Message</label><br></br>
				<div>{msgType}</div>
			</div>
			<div className='module'>
				<input
					type="text"
					placeholder="Who to ? "
					value={dest}
					onChange={(e) => setDest(e.target.value)}
				/>
				<div>{dest}</div>
			</div>
			<div className='module'>
			<input
				type="text"
				placeholder="Type your message"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<div>{message}</div>
			<button onClick={sendMessage}>Send</button>
			</div>	  
			<div className='module'>
			<Messages messages={messages} from={from}/>		
		</div>
			<div className='module'>
				<Rooms/>
			</div>

			<div className='module'>
				<FriendsRequest/>
			</div>
			<div className='module'>
				<UsersConnectedComponent/>
			</div>
		</div>
		<div className='conversations'>
			<div>
				<GroupChat className='groupchat' room={selected}/>	
			</div>
		</div>
	  </div>
	);
  }
  
  export default ChatComponent;

  