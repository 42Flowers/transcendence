import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import React, { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { ChannelDescription, ChannelMembership, addAdmin, ban, fetchAvailableChannels, fetchAvailableDMs, fetchChannelMembers, kick, mute, removeAdmin, unban, unmute } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import { ChatContext, ChatContextType } from "../../contexts/ChatContext";
import { queryClient } from "../../query-client";
import SocketContext, { useSocketEvent } from '../Socket/Context/Context';
import { UserAvatar } from "../UserAvatar";
import { UserLeftChannelPayload } from './Chat';

type Props = {
    side: string
}

interface Member {
    userId: number;
    userName: string;
    membershipState: number;
    permissionMask: number;
    avatar: string | null;
}

interface Channel {
    channelId: number;
    channelName: string;
    userPermissionMask: number;
    accessMask: number;
    membershipState: number;
}

interface ChannelMember {
    userId: number;
}

interface Dm {
    conversationId: number
    targetId: number;
    targetName: string;
    avatar: string | null;
}

type DisplayProps = {
    myId: number | undefined
    userId: number
    userName: string
    avatar: string | null
    userPermissionMask?: number
    myPermissionMask?: number
    currentChannel?: number
    memberShipState?: number
}

type FunctionType = (myPermissionMask: number) => void;

type DropdownProps = {
    options: string[],
    onOptionClick: (option: string) => void,
    functions: { [key: string]: (permissionMask: number) => void },
    myPermissionMask?: number
}

const Dropdown: React.FC<DropdownProps> = ({ options, onOptionClick, functions, myPermissionMask }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(!isOpen);
   
    return (
      <div>
        <button onClick={toggleOpen} className="channelActionAndHideButtons">{isOpen ? 'HIDE' : 'ACTION'}</button>
        {isOpen && (
          <div className="channelBackgroundButtons">
            {options.map((option, index) => (
                <button key={index} onClick={() => {
                    onOptionClick(option);
                    if (option === 'Add Admin') {
                        functions[option](myPermissionMask);
                    } else {
                        functions[option]();
                    }
                }} className="channelButtons">
                    {option}
                </button>
            ))}
          </div>
        )}
      </div>
    );
   };

const DisplayUser: React.FC<DisplayProps> = ({ myId, userId, userName, avatar, userPermissionMask, myPermissionMask, currentChannel, memberShipState}) => {
    const [options, setOptions] = useState<string[]>([]);
    const { chanOrDm } = useContext(ChatContext) as ChatContextType;
    const { socket } = useContext(SocketContext);

    const handleOptionClick = (option: string) => {
    };


    useEffect(() => {
        const options: string[] = [];

        if (myPermissionMask !== undefined && userPermissionMask !== undefined && myPermissionMask > userPermissionMask) {
            if (memberShipState === 4) {
                options.push('Unban');
            } else {
                if (memberShipState === 1) {
                    options.push('Mute');
                } else if (memberShipState === 2) {
                    options.push('Unmute');
                }
                options.push('Kick', 'Ban');

                if (2 === userPermissionMask) {
                    options.push('Remove Admin');
                } else {
                    options.push('Add Admin');
                }
            }
        }

        options.push('Play');
        setOptions(options);

    }, [myPermissionMask, userPermissionMask, memberShipState]);

    const muteMutation = useMutation({
        mutationFn: mute,
        onError() {
            alert("Cannot unmute");
        }
    });

    const unmuteMutation = useMutation({
        mutationFn: unmute,
        onError() {
            alert("Cannot unmute");
        }
    });

    const banMutation = useMutation({
        mutationFn: ban,
        onSuccess(_data, { channelId, targetId }) {
            queryClient.setQueryData([ 'channel-members', channelId ], (memberships: Member[] | undefined) =>
                map(memberships, ({ membershipState, userId, ...membership }: Member) => ({
                        userId,
                        membershipState: (userId === targetId) ? 4 : membershipState,
                        ...membership,
                })));
        },
        onError() {
            alert("Cannot ban");
        }
    });

    const unbanMutation = useMutation({
        mutationFn: unban,
        onSuccess(_data, { channelId, targetId }) {
            queryClient.setQueryData([ 'channel-members', channelId ], (memberships: Member[] | undefined) =>
                map(memberships, ({ membershipState, userId, ...membership }: Member) => ({
                    userId,
                    membershipState: (userId === targetId) ? 1 : membershipState,
                    ...membership,
                })));
        },
        onError() {
            alert("Cannot unban");
        }
    });

    const kickMutation = useMutation({
        mutationFn: kick,
        onSuccess(_data, { channelId, targetId }) {
            queryClient.setQueryData(['channel-members', channelId], (memberships: ChannelMember[] | undefined) =>
                filter(memberships, ({ userId }: ChannelMember) => userId !== targetId));
        },
        onError() {
            alert("Cannot kick");
        }
    });

    const addAdminMutation = useMutation({
        mutationFn: addAdmin,
        onError() {
            alert("Cannot add admin");
        }
    });

    const removeAdminMutation = useMutation({
        mutationFn: removeAdmin,
        onError() {
            alert("Cannot remove admin");
        }
    });

    const functions: Record<string, FunctionType> = {
        'Mute': () => {
            setOptions(['Unmute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            muteMutation.mutate({ channelId: currentChannel, targetId: userId });
        },
        'Unmute': () => {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            unmuteMutation.mutate({ channelId: currentChannel, targetId: userId });
        },
        'Ban': () => {
            setOptions(['Unban', 'Play'])
            banMutation.mutate({ channelId: currentChannel!, targetId: userId });
        },
        'Unban': () => {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            unbanMutation.mutate({ channelId: currentChannel!, targetId: userId });
        },
        'Kick': () => {
            kickMutation.mutate({ channelId: currentChannel!, targetId: userId });
        },
        'Add Admin': (myPermissionMask: number) => {
            if (myPermissionMask === 4) {
                setOptions(['Mute', 'Kick', 'Ban', 'Remove Admin', 'Play']);
            } else {
                setOptions(['Play']);
            }
            addAdminMutation.mutate({ channelId: currentChannel, targetId: userId });
        },
        'Remove Admin': () => {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            removeAdminMutation.mutate({ channelId: currentChannel, targetId: userId });
        },
        'Play': () => {
            socket?.emit("inviteNormal", userId);
        },
    };
    
    return (
        <>
            <div className="avatarCursorPointer">
            <UserAvatar
                    userId={userId}
                    avatar={avatar} />
            </div>
            <p>{userName}</p>
            <div className="channelButtonsplace">
                {
                    (myId !== userId && chanOrDm === 'channel') &&
                    <div className="channelButtonForUsers">
                        <Dropdown options={options} onOptionClick={handleOptionClick} functions={functions} myPermissionMask={myPermissionMask}/>
                    </div>
                }
            </div>
        </>
    );
}

const MembersList: React.FC = () => {
    const { currentChannel, usersOrBanned, myPermissionMask, setMyPermissionMask } = useContext(ChatContext);
    const auth = useAuthContext();
    const allMembers = useQuery(['channel-members', currentChannel], () => fetchChannelMembers(currentChannel));
    const channelsList = useQuery(['channels-list' ], () => fetchAvailableChannels);
  
    React.useEffect(() => {
        forEach(channelsList.data, ({ channelId, userPermissionMask }) => {
            if (channelId === currentChannel) {
                setMyPermissionMask(userPermissionMask);
            }
        });
    }, [ channelsList, setMyPermissionMask, currentChannel ]);

    /* Sent when a channel member privileges has been updated (banned, unban) */
    useSocketEvent<MembershipUpdatePayload>('member.update.state', ({ channelId, membershipState: newMembershipState, userId: targetId }) => {
        const queryKey = [ 'channel-members', channelId ];
        
        if (queryClient.getQueryData(queryKey) !== undefined) {
            queryClient.setQueryData<ChannelMembership[]>(queryKey, members => map(members, ({ userId, membershipState, ...rest }) => ({
                userId,
                membershipState: (targetId === userId) ? newMembershipState : membershipState,
                ...rest,
            })));
        }
    });

    return (
        usersOrBanned === 'users' 
                ?
                    <div className="listClass">
                        {allMembers.isFetched && map(allMembers.data, (member: Member) => (
                            member.membershipState !== 4 &&
                                <div key={member.userId} className="listRightClass">
                                    <DisplayUser myId={auth.user?.id} userId={member.userId} userName={member.userName} avatar={member.avatar} userPermissionMask={member.permissionMask} myPermissionMask={myPermissionMask} currentChannel={currentChannel} memberShipState={member.membershipState}/>
                                </div>
                        ))}
                    </div>
                : // if banned users
                    <div className="listClass">
                        {allMembers.isFetched && map(allMembers.data, (member: Member) => (
                            member.membershipState === 4
                                ?
                                    <div key={member.userId} className="listRightClass">
                                        <DisplayUser myId={auth.user?.id} userId={member.userId} userName={member.userName} avatar={member.avatar} userPermissionMask={member.permissionMask} myPermissionMask={myPermissionMask} currentChannel={currentChannel} memberShipState={member.membershipState}/>
                                    </div>
                                :
                                    null
                        ))}
                    </div>
    );
};

type MembershipUpdatePayload = {
    channelId: number;
    userId: number;
    membershipState: number;
}
  
const List: React.FC<Props> = ({ side }) => {
    const { chanOrDm, setCurrentChannel, setCurrentDm, currentChannel, setCurrentChannelName, setCurrentAccessMask, setIsBanned, setMyPermissionMask, setCurrentConv } = useContext(ChatContext) as ChatContextType;
    const channels = useQuery(['channels-list'], fetchAvailableChannels);
    const directMessages = useQuery('direct-messages-list', fetchAvailableDMs);
    const auth = useAuthContext();

    const ctx = useContext(ChatContext);

    /* Sent when kicked out of the channel */
    useSocketEvent<UserLeftChannelPayload>('user.left.channel', ({ userId, channelId }) => {
        if (userId !== auth.user?.id)
            return ;
        
        if (currentChannel === channelId) {
            ctx.setCurrentChannel(0);
            ctx.setCurrentChannelName('');
            ctx.setCurrentAccessMask(1);
            ctx.setMyPermissionMask(0);
        }

        if (queryClient.getQueryData([ 'channels-list' ]) !== undefined) {
            /* Remove the channel from the list */
            queryClient.setQueryData<ChannelDescription[]>([ 'channels-list' ], channels =>
                filter(channels, channel => channel.channelId !== channelId)
            );
        }
    }, [ ctx ]);

    // right // 1 not ban | 4 ban 
    // channel1

    return (
        side === 'left'
            ?
                chanOrDm === 'channel' 
                    ?
                        <div className="listClass">
                            {channels.isFetched && map(channels.data, (channel: Channel) => (
                                <div key={channel.channelId} onClick={() => {
                                    if (channel.membershipState === 4) {
                                        setIsBanned(true);
                                    }
                                    setCurrentChannel(channel.channelId)
                                    setCurrentChannelName(channel.channelName)
                                    setCurrentAccessMask(channel.accessMask)
                                }}>
                                    <p className="listLeftClass">{channel.channelName}</p>
                                </div>
                            ))}
                        </div>
                    :
                        <div className="listClass">
                            {directMessages.isFetched && map(directMessages.data, (dm: Dm) => (
                                <div key={dm.targetId} className="listLeftClass" onClick={() => {
                                    setCurrentDm(dm.targetId)
                                    setCurrentConv(dm.conversationId)
                                }}>
                                   <p>{dm.targetName}</p>
                                </div>
                            ))}
                        </div>
            :
                <>
                    {currentChannel !== 0 && <MembersList />}
                </>
    );
};

export default List;
