import { ChatContext } from "../../contexts/ChatContext";
import { useContext, useState, useEffect, useRef } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchAvailableChannels, fetchAvailableDMs, fetchAvailableUsers, fetchChannelMembers } from "../../api";
import React from "react";
import './Chat.css';
import AvatarOthers from "../AvatarOthers/AvatarOthers";
import default_avatar from '../../assets/images/default_avatar.png';
import { useAuthContext } from "../../contexts/AuthContext";

type Props = {
    side: string
}

type DisplayProps = {
    myId: number
    userId: number
    userName: string
    avatar: string
    userPermissionMask: number
    myPermissionMask: number
}

type DropdownProps = {
    options: string[],
    onOptionClick: (option: string) => void,
    functions: { [key: string]: () => void },
    myPermissionMask: number
}

const Dropdown: React.FC<DropdownProps> = ({ options, onOptionClick, functions, myPermissionMask }) => {
    const [isOpen, setIsOpen] = useState(false);
   
    const toggleOpen = () => setIsOpen(!isOpen);
   
    return (
      <div>
        {isOpen ? <button onClick={toggleOpen}>HIDE</button> : <button onClick={toggleOpen}>ACTION</button>}
        {isOpen && (
          <div>
            {options.map((option, index) => (
                <button key={index} onClick={() => {
                    onOptionClick(option);
                    if (option === 'Add Admin') {
                        functions[option](myPermissionMask);
                    } else {
                        functions[option]();
                    }
                }}>
                    {option}
                </button>
            ))}
          </div>
        )}
      </div>
    );
   };

const DisplayUser: React.FC<DisplayProps> = ({ myId, userId, userName, avatar, userPermissionMask, myPermissionMask}) => {
    const [availability, setAvailability] = useState<string>('');
    const [options, setOptions] = useState([]);

    const handleOptionClick = (option) => {
        console.log(`Option ${option} clicked`);
    };

    const usersQuery = useQuery(['available-users'], fetchAvailableUsers, {
        onSuccess: (data) => {
            data.map(([ id, pseudo, availability ]) => {
                if (userId === id) {
                    setAvailability(availability);
                }
            });
        }
    });

    useEffect(() => {
        if (myPermissionMask > userPermissionMask) {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
        } else {
            setOptions(['Play']);
        }
    }, [myPermissionMask, userPermissionMask]);

    const functions = {
        'Mute': () => {
            setOptions(['Unmute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            // TODO: mute userId
        },
        'Unmute': () => {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            // TODO: unmute userId
        },
        'Ban': () => {
            setOptions(['Unban', 'Play'])
            // TODO: ban userId
        },
        'Unban': () => {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            // TODO: unban userId
        },
        'Kick': () => {
        },
        'Add Admin': (myPermissionMask: number) => {
            if (myPermissionMask === 4) {
                setOptions(['Mute', 'Kick', 'Ban', 'Remove Admin', 'Play']);
            } else {
                setOptions(['Play']);
            }
            // TODO: add admin to userId
        },
        'Remove Admin': () => {
            setOptions(['Mute', 'Kick', 'Ban', 'Add Admin', 'Play']);
            // TODO: Remove admin to userId
        },
        'Play': () => {
            // TODO: send invitation to play
        },
    };
    
    return (
        <>
            { 
                avatar ?
                    <AvatarOthers status={availability} avatar={`http://localhost:3000/static/${avatar}`} userId={userId} />
                :
                    <AvatarOthers status={availability} avatar={default_avatar} userId={userId} />
            }
            <p>{userName}</p>
            { myId !== userId
                ?
                    <Dropdown options={options} onOptionClick={handleOptionClick} functions={functions} myPermissionMask={myPermissionMask}/>
                :
                    null
            }
        </>
    );
}


const MembersList: React.FC = () => {
    const { currentChannel, setCurrentChannel, usersOrBanned, myPermissionMask, setMyPermissionMask } = useContext(ChatContext) as ChatContextType;
    const allMembers = useQuery(['channel-members', currentChannel, setCurrentChannel], () => fetchChannelMembers(currentChannel));
    const auth = useAuthContext();

    useEffect(() => {
        allMembers.isFetched && allMembers.data.map(member => {
            if (member.userId === auth.user.id)
                setMyPermissionMask(member.permissionMask);
        });
     }, [allMembers.data, auth.user.id]);

    return (
        usersOrBanned === 'users' 
                ?
                    <div className="listClass">
                        {allMembers.isFetched && allMembers.data.map(member => (
                            member.membershipState !== 4
                                ?
                                    <div key={member.userId} className="listRightClass">
                                        <DisplayUser myId={auth.user.id} userId={member.userId} userName={member.userName} avatar={member.avatar} userPermissionMask={member.permissionMask} myPermissionMask={myPermissionMask}/>
                                    </div>
                                :
                                    null
                        ))}
                    </div>
                : // if banned users
                    <div className="listClass">
                        {allMembers.isFetched && allMembers.data.map(member => (
                            member.membershipState === 4
                                ?
                                    <div key={member.userId}>
                                        <p className="listRightClass">{member.userName}</p>
                                    </div>
                                :
                                    null
                        ))}
                    </div>
    );
};
  

const List: React.FC<Props> = ({ side }) => {
    const { chanOrDm, setCurrentChannel, setCurrentDm, currentChannel, currentDm, setCurrentChannelName } = useContext(ChatContext) as ChatContextType;
    
    const channels = useQuery(['channels-list'], fetchAvailableChannels);
    const directMessages = useQuery('direct-messages-list', fetchAvailableDMs);

    // right // 1 not ban | 4 ban 
    // channel1

    return (
        side === 'left'
            ?
                chanOrDm === 'channel' 
                    ?
                        <div className="listClass">
                            {channels.isFetched && channels.data.map(channel => (
                                <div key={channel.channelId} onClick={() => {
                                    setCurrentChannel(channel.channelId)
                                    setCurrentChannelName(channel.channelName)
                                }}>
                                    <p className="listLeftClass">{channel.channelName}</p>
                                </div>
                            ))}
                        </div>
                    :
                        <div className="listClass">
                            {directMessages.isFetched && directMessages.data.map(dm => (
                                <div key={dm.targetId} onClick={() => setCurrentDm(dm.targetId)}>
                                    <p className="listLeftClass">{dm.targetName}</p>
                                </div>
                            ))}
                        </div>
            :
                currentChannel && <MembersList />
    );
};

export default List;
