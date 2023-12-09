import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchBlockedUsers, fetchChannelMessages, fetchDmMessages } from "../../api";

const isBlocked = (blockedIdArray: {blockedId: number}[], id: number) => {
    for (let i = 0; i < blockedIdArray.length; ++i) {
        // console.log("id: ", id, "     blockedIdcurr: ", blockedIdArray[i].blockedId)
        if (id === blockedIdArray[i].blockedId) {
            // console.log("blocked !!!");
            return true;
        }
    }
    return false;
}

const MessagesChannel: React.FC = () => {
    const { currentChannel } = useContext(ChatContext) as ChatContextType;
    const channelMessages = useQuery(['channel-messages', currentChannel], () => fetchChannelMessages(currentChannel));
    const blockedUsers = useQuery('blocked-users', fetchBlockedUsers);

    return (
        <>
            {channelMessages.isFetched && blockedUsers.isFetched && channelMessages.data.map(msg => {
                isBlocked(blockedUsers.data, msg.authorId) == true ? null :
                        <div key={msg.id}>
                            <p>{msg.authorName}</p>
                            <p>{msg.content}</p>
                        </div>
            })}
        </>
    );
};

const MessagesDm: React.FC = () => {
    const { currentDm } = useContext(ChatContext) as ChatContextType;
    const dmMessages = useQuery(['dm-messages', currentDm], () => fetchDmMessages(currentDm));
    // const blockedUsers = useQuery('blocked-users', () => fetchBlockedUsers);

    /*
    //  TODO
    // hide messages from blocked users (using their ID for example)
    */
    return (
        <>
            {dmMessages.isFetched && dmMessages.data.map(msg => {
                <div key={msg.id}>
                    <p>{msg.authorName}</p>
                    <p>{msg.content}</p>
                </div>
            })}
        </>
    );
};

const DisplayMessages: React.FC = () => {
    const { chanOrDm, currentChannel, currentDm } = useContext(ChatContext) as ChatContextType;

    return (
        chanOrDm === 'channel' ?
            currentChannel && <MessagesChannel />
        :
            currentDm && <MessagesDm />
    );
};

export default DisplayMessages;
