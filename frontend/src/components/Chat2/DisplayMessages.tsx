import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";

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
    const channel1 = [
        {   
            messageId: 1,
            authorName: "Macron", 
            content: "Hello",
        },
        {   
            messageId: 2,
            authorName: "Poutine", 
            content: "Hellooo",
        },
        {   
            messageId: 3,
            authorName: "Coluche", 
            content: "Hello",
        },
    ]

    const channel2 = [
        {   
            authorName: "Macron", 
            content: "A",
        },
        {   
            authorName: "Poutine", 
            content: "B",
        },
        {   
            authorName: "Coluche", 
            content: "C",
        },
    ]

    const dmMacron = [
        {
            authorName: "Macron",
            content: "Heyy Coluche",
        },
        {
            authorName: "Coluche",
            content: "Heyy Macron",
        },
    ]

    return (
        chanOrDm === 'channel' && currentChannel === 1 ?
            <>
                {channel1.map(msg => (
                    <div key={msg.messageId}>
                        <p>{msg.authorName}</p>
                        <p>{msg.content}</p>
                    </div>
                ))}
            </>
        :
        ''
    );
};

export default DisplayMessages;