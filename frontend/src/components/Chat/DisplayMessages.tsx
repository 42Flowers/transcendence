import { ChatContext } from "../../contexts/ChatContext";
import { useCallback, useContext, useEffect, useState, createRef } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchBlockedUsers, fetchChannelMessages, fetchDmMessages } from "../../api";
import SocketContext from "../Socket/Context/Context";
import { Socket } from "socket.io-client";
import './Chat.css';
import { queryClient } from "../../query-client";
import { useAuthContext } from "../../contexts/AuthContext";
import map from "lodash/map";
import sortBy from "lodash/sortBy";

interface messageElem {
    type: string, //conversation/channel
    id: number, //channelId/targetId
    authorId: number,
    authorName: string 
    message: string,
    creationTime: Date,
}

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
    const { user } = useAuthContext();

    const [sortedMessages, setSortedMessages] = useState([]);

    console.log("HEYYYY", channelMessages.data);
    // const updateChannelMessages = useCallback((msg: messageElem) => {
    //     console.log(msg)
    //     // id undefined et besoin de l'id du message
    //     if (msg.type !== "channel" || msg.id != currentChannel)
    //         return;
    //         queryClient.setQueryData(['channels-messages'], (messages) => [...messages, {id: 12, authorId: msg.authorId, authorName: msg.authorName, content: msg.message, createdAt: msg.creationTime}]);
    // }, []);

    // useEffect(() => {
    //     SocketState.socket?.on("message", updateChannelMessages);
        
    //     return () => {
    //         SocketState.socket?.off("message", updateChannelMessages);
    //     }
    // }, [SocketState.socket]);

    /*
    // TODO
    //
    // Sort messages by creationDate before display
    */

    const getTime = (date) => {
        const dateObject = new Date(date);
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        if (channelMessages.isFetched) {
            setSortedMessages(sortBy(channelMessages.data, ['createdAt']));
        }
    }, [channelMessages.isFetched, channelMessages.data]);

    const messagesEndRef = createRef<HTMLDivElement>();

    useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [channelMessages.data, messagesEndRef]);

    return (
        <div ref={messagesEndRef} className="displayMessageClass">
            {channelMessages.isFetched && blockedUsers.isFetched && map(sortedMessages, msg => (
                isBlocked(blockedUsers.data, msg.authorId)
                    ?
                        null
                    :
                        msg.authorId === user.id 
                            ?
                                <div key={msg.id} className="userBubble">
                                    <p className="userNameBubble">{msg.authorName} - {getTime(msg.createdAt)}</p>
                                    <p className="userConvBubble">{msg.content}</p>
                                </div>
                            :
                                <div key={msg.id} className="otherBubble">
                                    <p className="otherNameBubble">{msg.authorName} - {getTime(msg.createdAt)}</p>
                                    <p className="otherConvBubble">{msg.content}</p>
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
    const { user } = useAuthContext();

    const [sortedMessages, setSortedMessages] = useState([]);

    // const updateDmMessages = useCallback((msg: messageElem) => {
    //     if (msg.type === "channel" || msg.id != currentDm)
    //         return;
    //     queryClient.setQueryData(['channels-messages'], (messages) => [...messages, {id: msg.messageId, authorId: msg.authorId, authorName: msg.authorName, content: msg.message, createdAt: msg.creationTime}]);
    // }, []);

    // useEffect(() => {
    //     SocketState.socket?.on("message", updateDmMessages);
        
    //     return () => {
    //         SocketState.socket?.off("message", updateDmMessages);
    //     }
    // }, [SocketState.socket]);

    /*
    // TODO
    //
    // Sort messages by creationDate before display
    */

    const getTime = (date) => {
        const dateObject = new Date(date);
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        if (dmMessages.isFetched) {
            setSortedMessages(sortBy(dmMessages.data, ['createdAt']));
        }
    }, [dmMessages.isFetched, dmMessages.data]);

    const messagesEndRef = createRef<HTMLDivElement>();

    useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [dmMessages.data, messagesEndRef]);

    console.log("HEEEEY",dmMessages.data);
    return (
        <div ref={messagesEndRef} className="displayMessageClass">
            {dmMessages.isFetched && blockedUsers.isFetched && map(sortedMessages, msg => (
                isBlocked(blockedUsers.data, msg.authorId)
                    ? 
                        null
                    :
                        msg.authorId === user.id 
                            ?
                                <div key={msg.id} className="userBubble">
                                    <p className="userNameBubble">{msg.authorName} - {getTime(msg.creationTime)}</p>
                                    <p className="userConvBubble">{msg.content}</p>
                                </div>
                            :
                                <div key={msg.id} className="otherBubble">
                                    <p className="otherNameBubble">{msg.authorName} - {getTime(msg.creationTime)}</p>
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
            <>
                {currentChannel !== 0 && <MessagesChannel />}
            </>
        :
            <>
                {currentDm !== 0 && <MessagesDm />}
            </>
    );
};

export default DisplayMessages;

