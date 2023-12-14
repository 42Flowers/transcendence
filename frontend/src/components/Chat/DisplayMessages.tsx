import filter from "lodash/filter";
import map from "lodash/map";
import React, { createRef, useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { fetchBlockedUsers, fetchChannelMessages, fetchDmMessages } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import { ChatContext } from "../../contexts/ChatContext";

type MsgType = {
    id: number
    authorId: number
    authorName: string
    content: string
    createdAt: string
}


const MessagesChannel: React.FC = () => {
    const { currentChannel } = useContext(ChatContext);
    const channelMessages = useQuery(['channel-messages', currentChannel], () => fetchChannelMessages(currentChannel));
    const blockedUsersQuery = useQuery('blocked-users', fetchBlockedUsers);
    const { user } = useAuthContext();

    const blockedUsersSet = React.useMemo(() => new Set(map(blockedUsersQuery.data, ({ blockedId }) => blockedId)), [ blockedUsersQuery ]);

    const getTime = (date: string) => {
        const dateObject = new Date(date);
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const messagesEndRef = React.createRef<HTMLDivElement>();

    React.useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [channelMessages.data, messagesEndRef]);

    return (
        <div ref={messagesEndRef} className="displayMessageClass">
            {map(filter(channelMessages.data, ({ authorId }) => !blockedUsersSet.has(authorId)), (msg: MsgType) => (
                msg.authorId === user?.id 
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
    const { currentConv } = useContext(ChatContext);
    const dmMessages = useQuery(['dm-messages', currentConv], () => fetchDmMessages(currentConv));
    const blockedUsers = useQuery('blocked-users', fetchBlockedUsers);
    const { user } = useAuthContext();

    const blockedUsersSet = React.useMemo(() => new Set(map(blockedUsers.data, ({ blockedId }) => blockedId)), [ blockedUsers ]);

    const getTime = (date: string) => {
        const dateObject = new Date(date);
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const messagesEndRef = createRef<HTMLDivElement>();

    useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [dmMessages.data, messagesEndRef]);

    return (
        <div ref={messagesEndRef} className="displayMessageClass">
            {map(filter(dmMessages.data, ({ authorId }) => !blockedUsersSet.has(authorId)), (msg: MsgType) => (
                msg.authorId === user?.id 
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
