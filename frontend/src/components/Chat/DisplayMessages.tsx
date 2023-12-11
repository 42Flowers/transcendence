import { ChatContext, ChatContextType } from "../../contexts/ChatContext";
import { useCallback, useContext, useEffect, useState, createRef } from "react";
import { useQuery } from "react-query";
import { ChannelMessage, PrivateMessage, fetchBlockedUsers, fetchChannelMessages, fetchDmMessages } from "../../api";
import { useSocketEvent } from "../Socket/Context/Context";
import './Chat.css';
import { queryClient } from "../../query-client";
import { useAuthContext } from "../../contexts/AuthContext";
import map from "lodash/map";
import sortBy from "lodash/sortBy";

interface NewMessageElem {
    type: string, //conversation/channel
    id: number, //channelId/targetId
    authorId: number,
    authorName: string 
    message: string,
    createdAt: string,
    msgId: number,
}

interface Message {
    id: number;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
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
    const { currentChannel } = useContext(ChatContext);
    const channelMessages = useQuery(['channel-messages', currentChannel], () => fetchChannelMessages(currentChannel));
    const blockedUsers = useQuery('blocked-users', fetchBlockedUsers);
    const { user } = useAuthContext();


    const [sortedMessages, setSortedMessages] = useState<Message[]>([]);

    const updateChannelMessages = useCallback((msg: NewMessageElem) => {
        if (!msg || msg.type !== "channel" || msg.id != currentChannel)
            return ;

        setSortedMessages((prevMessages) => [...prevMessages, {
            id: msg.msgId,
            authorId: msg.authorId,
            authorName: msg.authorName,
            content: msg.message,
            createdAt: msg.createdAt,
        }]);
    }, []);

    useSocketEvent('message', updateChannelMessages);

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
    const { currentDm } = useContext(ChatContext);
    const dmMessages = useQuery(['dm-messages', currentDm], () => fetchDmMessages(currentDm));
    const blockedUsers = useQuery('blocked-users', fetchBlockedUsers);
    const { user } = useAuthContext();

    const [sortedMessages, setSortedMessages] = useState<Message[]>([]);

    const updateDmMessages = useCallback((msg: NewMessageElem) => {
        console.log("DM", msg);
        if (!msg || msg.type === "channel" || msg.id != currentDm)
            return;

        setSortedMessages((prevMessages) => [...prevMessages, {
            id: msg.msgId,
            authorId: msg.authorId,
            authorName: msg.authorName,
            content: msg.message,
            createdAt: msg.createdAt,
        }]);
    }, []);

    useSocketEvent('message', updateDmMessages);

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
    const { chanOrDm, currentChannel, currentDm } = useContext(ChatContext);

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

