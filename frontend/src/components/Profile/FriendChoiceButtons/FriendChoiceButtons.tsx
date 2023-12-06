// import React, { useEffect, useState } from 'react';
import MainButton from '../../MainButton/MainButton';
import './FriendChoiceButtons.css';
import { useMutation, useQuery } from 'react-query';
import { addUser, blockUser, fetchIsBlocked, fetchIsFriended, unblockUser } from '../../../api';
import { queryClient } from '../../../query-client';

interface Props {
	userId: number;
	friendId: number;
}

const FriendChoiceButtons: React.FC<Props> = ({userId, friendId}) => {

	const isFriendedKey = [ userId, 'is_friended_with', friendId ];
	const isBlockedKey = [ userId, 'has_blocked', friendId ];

	const isFriended = useQuery(isFriendedKey, () => fetchIsFriended(userId, friendId));
	const isBlocked = useQuery(isBlockedKey, () => fetchIsBlocked(userId, friendId));

	const addMutation = useMutation<unknown, unknown, Props>({
		mutationFn: ({userId, friendId}) => addUser(userId, friendId),
		onSuccess(data) {
			queryClient.setQueryData(isFriendedKey, {
				isFriended: true,
			})
		}
	})
	const blockMutation = useMutation<unknown, unknown, Props>({
		mutationFn: ({ userId, friendId }) => blockUser(userId, friendId),
		onSuccess(data) {
			queryClient.setQueryData(isBlockedKey, {
				isBlocked: true,
			});
		}
	});
	const unblockMutation = useMutation<unknown, unknown, Props>({
		mutationFn: ({ userId, friendId }) => unblockUser(userId, friendId),
		onSuccess(data) {
			queryClient.setQueryData(isBlockedKey, {
				isBlocked: false,
			});
		}
	});

	const handleAdd = () => {
		addMutation.mutate({ userId, friendId});
	}

	const handleBlock = () => {
		blockMutation.mutate({ userId, friendId });
	}
	
	const handleUnblock = () => {
		unblockMutation.mutate({ userId, friendId })
	}
	
	if (isFriended.data?.isFriended)
	{
		if (isBlocked.data?.isBlocked)
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
	else if (isFriended.data?.isFriended === false)
	{
		if (isBlocked.data?.isBlocked)
		{
			return (
				<div className='parent-friend-choice-buttons'>
					<div className='friend-choice-buttons'>
						<MainButton buttonName='Unblock' onClick={() => handleUnblock()} />
						isnot fri b
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
};
		
		
export default FriendChoiceButtons;