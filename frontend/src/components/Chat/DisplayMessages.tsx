import { ChatContext } from "../../contexts/ChatContext";
import { useCallback, useContext, useEffect } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchBlockedUsers, fetchChannelMessages, fetchDmMessages } from "../../api";
import SocketContext from "../Socket/Context/Context";
import { Socket } from "socket.io-client";
import './Chat.css';

const isBlocked = (blockedIdArray: {blockedId: number}[], id: number) => {
    for (let i = 0; i < blockedIdArray.length; ++i) {
        if (id === blockedIdArray[i].blockedId) {
            return true;
        }
    }
    return false;
}

const MessagesChannel: React.FC = () => {
    const { currentChannel } = useContext(ChatContext) as ChatContextType;
    const { SocketState } = useContext(SocketContext);
    const channelMessages = useQuery(['channel-messages', currentChannel], () => fetchChannelMessages(currentChannel));
    const blockedUsers = useQuery('blocked-users', fetchBlockedUsers);

    // const updateChannelMessages = useCallback(() => {

    // }, []);

    // useEffect(() => {
    //     SocketState.socket?.on("message", updateChannelMessages);
        
    //     return () => {
    //         SocketState.socket?.off("message", updateChannelMessages);
    //     }
    // }, [SocketState.socket]);

    return (
        <div className="displayMessageClass">
            {channelMessages.isFetched && blockedUsers.isFetched && channelMessages.data.map(msg => (
                isBlocked(blockedUsers.data, msg.authorId)
                    ? 
                        null
                    :
                        <div key={msg.id} className="userBubble">
                            <p className="userNameBubble">{msg.authorName}</p>
                            <p className="userConvBubble">{msg.content}</p>
                        </div>
            ))}
        </div>
    );
};

const MessagesDm: React.FC = () => {
    const { currentDm } = useContext(ChatContext) as ChatContextType;
    const { SocketState } = useContext(SocketContext);
    const dmMessages = useQuery(['dm-messages', currentDm], () => fetchDmMessages(currentDm));
    const blockedUsers = useQuery('blocked-users', fetchBlockedUsers);

    // const updateChannelMessages = useCallback(() => {

    // }, []);

    // useEffect(() => {
    //     SocketState.socket?.on("message", updateChannelMessages);
        
    //     return () => {
    //         SocketState.socket?.off("message", updateChannelMessages);
    //     }
    // }, [SocketState.socket]);

    return (
        <div className="displayMessageClass">
            {dmMessages.isFetched && blockedUsers.isFetched && dmMessages.data.map(msg => (
                isBlocked(blockedUsers.data, msg.authorId)
                    ? 
                        null
                    :
                        <div key={msg.id} className="otherBubble">
                            <p className="otherNameBubble">{msg.authorName}</p>
                            <p className="otherConvBubble">{msg.content}</p>
                        </div>
            ))}
        </div>
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
