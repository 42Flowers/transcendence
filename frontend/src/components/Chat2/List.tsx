import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchAvailableChannels, fetchAvailableDMs, fetchChannelMembers } from "../../api";
import React from "react";


type Props = {
    side: string
}

const MembersList: React.FC = () => {
    const { currentChannel, usersOrBanned } = useContext(ChatContext) as ChatContextType;
    const allMembers = useQuery(['channel-members', currentChannel], () => fetchChannelMembers(currentChannel));

    return (
        usersOrBanned === 'users' 
                ?
                    <>
                        {allMembers.isFetched && allMembers.data.map(member => (
                            member.membershipState === 1
                                ?
                                    <div key={member.userId}>
                                        <p>{member.userName}</p>
                                    </div>
                                :
                                    null
                        ))}
                    </>
                :
                    <>
                        {allMembers.isFetched && allMembers.data.map(member => (
                            member.membershipState === 4
                                ?
                                    <div key={member.userId}>
                                        <p>{member.userName}</p>
                                    </div>
                                :
                                    null
                        ))}
                    </>
    );
};
  

const List: React.FC<Props> = ({ side }) => {
    const { chanOrDm, setCurrentChannel, setCurrentDm, currentChannel, currentDm } = useContext(ChatContext) as ChatContextType;
    
    const channels = useQuery('channels-list', fetchAvailableChannels);
    const directMessages = useQuery('direct-messages-list', fetchAvailableDMs);

    // right // 1 not ban | 4 ban 
    // channel1

    return (
        side === 'left'
            ?
                chanOrDm === 'channel' 
                    ?
                        <>
                            {channels.isFetched && channels.data.map(channel => (
                                <div key={channel.channelId} onClick={() => setCurrentChannel(channel.channelId)}>
                                    <p>{channel.channelName}</p>
                                </div>
                            ))}
                        </>
                    :
                        <>
                            {directMessages.isFetched && directMessages.data.map(dm => (
                                <div key={dm.targetId} onClick={() => setCurrentDm(dm.targetId)}>
                                    <p>{dm.targetName}</p>
                                </div>
                            ))}
                        </>
            :
                currentChannel && <MembersList />
    );
};

export default List;
