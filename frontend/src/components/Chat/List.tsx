import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchAvailableChannels, fetchAvailableDMs, fetchChannelMembers } from "../../api";
import React from "react";
import './Chat.css';

type Props = {
    side: string
}

const MembersList: React.FC = () => {
    const { currentChannel, setCurrentChannel, usersOrBanned } = useContext(ChatContext) as ChatContextType;
    const allMembers = useQuery(['channel-members', currentChannel, setCurrentChannel], () => fetchChannelMembers(currentChannel));

    return (
        usersOrBanned === 'users' 
                ?
                    <div className="listClass">
                        {allMembers.isFetched && allMembers.data.map(member => (
                            member.membershipState !== 4
                                ?
                                    <div key={member.userId}>
                                        <p className="listRightClass">{member.userName}</p>
                                    </div>
                                :
                                    null
                        ))}
                    </div>
                :
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
    const { chanOrDm, setCurrentChannel, setCurrentDm, currentChannel, currentDm } = useContext(ChatContext) as ChatContextType;
    
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
                                <div key={channel.channelId} onClick={() => setCurrentChannel(channel.channelId)}>
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
