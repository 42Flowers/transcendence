import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";
import { useQuery } from "react-query";
import { fetchBlockedUsers, fetchChannelMessages, fetchDmMessages } from "../../api";

const MessagesChannel: React.FC = () => {
    const { currentChannel } = useContext(ChatContext) as ChatContextType;
    const channelMessages = useQuery(['channel-messages', currentChannel], () => fetchChannelMessages(currentChannel));
    const blockedUsers = useQuery('blocked-users', () => fetchBlockedUsers);
    console.log("Blocked users IDs", blockedUsers.data);

    /*
    //  TODO
    // hide messages from blocked users (using their ID for example)
    */
    return (
        <>
            {channelMessages.isFetched && channelMessages.data.map(msg => (
                <div key={msg.id}>
                    <p>{msg.authorName}</p>
                    <p>{msg.content}</p>
                </div>
            ))}
        </>
    );
};

const MessagesDm: React.FC = () => {
    const { currentDm } = useContext(ChatContext) as ChatContextType;
    const dmMessages = useQuery(['dm-messages', currentDm], () => fetchDmMessages(currentDm));
    const blockedUsers = useQuery('blocked-users', () => fetchBlockedUsers);

    /*
    //  TODO
    // hide messages from blocked users (using their ID for example)
    */
    return (
        <>
            {dmMessages.isFetched && dmMessages.data.map(msg => (
                <div key={msg.id}>
                    <p>{msg.authorName}</p>
                    <p>{msg.content}</p>
                </div>
            ))}
        </>
    );
};

const DisplayMessages: React.FC = () => {
    const { chanOrDm, currentChannel, currentDm } = useContext(ChatContext) as ChatContextType;

    /*
        If (chanOrDm === 'channel')
            query channel qui a l'id currentChannel
        else if (chanOrDm === 'dm))
            query dm conv qui correspond à mon id + l'id de l'autre user currentDm
    */

    /*
        chanOrDm === 'channel'
        currentChannel === 1 (channel1) 
    */
    // const channel1 = [
    //     {   
    //         messageId: 1,
    //         authorName: "Macron", 
    //         content: "Hello",
    //     },
    //     {   
    //         messageId: 2,
    //         authorName: "Poutine", 
    //         content: "Hellooo",
    //     },
    //     {   
    //         messageId: 3,
    //         authorName: "Coluche", 
    //         content: "Hello",
    //     },
    // ]

    // const channel2 = [
    //     {   
    //         authorName: "Macron", 
    //         content: "A",
    //     },
    //     {   
    //         authorName: "Poutine", 
    //         content: "B",
    //     },
    //     {   
    //         authorName: "Coluche", 
    //         content: "C",
    //     },
    // ]

    // const dmMacron = [
    //     {
    //         authorName: "Macron",
    //         content: "Heyy Coluche",
    //     },
    //     {
    //         authorName: "Coluche",
    //         content: "Heyy Macron",
    //     },
    // ]

    return (
        chanOrDm === 'channel' ?
            currentChannel && <MessagesChannel />
        :
            currentDm && <MessagesDm />
    );
};

export default DisplayMessages;
