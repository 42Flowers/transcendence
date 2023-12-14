import { useContext } from 'react';
import MainButton from '../MainButton/MainButton';
import { UserAvatar } from '../UserAvatar';
import './FriendItem.css';
import SocketContext from '../Socket/Context/Context';
import { useMutation } from 'react-query';
import { acceptFriendInvitation, blockUserMutation, cancelFriendInvitation, declineFriendInvitation, deleteFriendMutation, unblockUserMutation } from '../../api';
import { queryClient } from '../../query-client';

const SENDER = 0;
const RECEIVER = 1;
const FRIENDS = 2;
const BLOCKED = 3;
//0 sender   /1 receiver  /2 accepted /3 blocked

interface Props {
	friendName: string;
	status: number;
	avatar: string;
	friendId: number;
}

const FriendItem: React.FC<Props> = ({avatar, friendName, status, friendId }) => {
	const { socket } = useContext(SocketContext);

	const unblockFriend = useMutation({
        mutationFn: unblockUserMutation,
		onSuccess() {
			queryClient.refetchQueries('friendpage-friendlist');
		},
        onError() {
            alert("Cannot unblock this person");
        }
    });

	const blockFriend = useMutation({
        mutationFn: blockUserMutation,
		onSuccess() {
			queryClient.refetchQueries('friendpage-friendlist');
		},
        onError() {
            alert("Cannot block this person");
        }
    });

	const deleteFriend = useMutation({
        mutationFn: deleteFriendMutation,
		onSuccess() {
			queryClient.refetchQueries('friendpage-friendlist');
		},
        onError() {
            alert("Cannot delete this person from your friends");
        }
    });

	const cancelFriendInvite = useMutation({
        mutationFn: cancelFriendInvitation,
		onSuccess() {
			queryClient.refetchQueries('friendpage-friendlist');
		},
        onError() {
            alert("Cannot cancel the invitation you sent");
        }
    });

	const declineFriendInvite = useMutation({
        mutationFn: declineFriendInvitation,
		onSuccess() {
			queryClient.refetchQueries('friendpage-friendlist');
		},
        onError() {
            alert("Cannot decline this invitation");
        }
    });

	const acceptFriendInvite = useMutation({
        mutationFn: acceptFriendInvitation,
		onSuccess() {
			queryClient.refetchQueries('friendpage-friendlist');
		},
        onError() {
            alert("Cannot accept this invitation");
        }
    });

	const handleUnblock = () => {
		unblockFriend.mutate({ friendId: friendId });
	}

	const handleBlock = () => {
		blockFriend.mutate({ friendId: friendId });
	}

	const handleDelete = () => {
		deleteFriend.mutate({ friendId: friendId })
	}

	const handleCancel = () => {
		cancelFriendInvite.mutate({ friendId: friendId });
	}

	const handleDecline = () => {
		declineFriendInvite.mutate({ friendId: friendId });
	}

	const handleAccept = () => {
		acceptFriendInvite.mutate({ friendId: friendId })
	}

	const handlePlay = () => {
		socket?.emit("inviteNormal", friendId);
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
							<MainButton buttonName='Play' onClick={handlePlay} />
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
						<UserAvatar
							userId={friendId}
							avatar={avatar} />
						<p>{friendName}</p>
					</div>
					<div className='buttons'>
						<MainButton buttonName='Unblock' onClick={() => handleUnblock()} />
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
						<UserAvatar
							userId={friendId}
							avatar={avatar} />
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
						<UserAvatar
							userId={friendId}
							avatar={avatar} />
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
