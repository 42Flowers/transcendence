import { ChatContext } from "../../contexts/ChatContext";
import React, { useContext } from "react";
import './Chat.css';
import { ChatContextType } from "./Menu";

type Props = {
    containerRef: React.RefObject<HTMLDivElement>;
}

const DisplayMessages: React.FC<Props> = ({ containerRef }) => {
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
            content: "HEllo frehugiherwuibgrwubgobwrgyubrewytubvuyerwbveyrtbbibibuibuibububibibiubuibuibgvuvkvkygvyvicyibuverhveruv ertihubiv hreubvyerbvubwiyuberuvyberbvgeybvgrwbvgiebruvwbrehibovuejvcij;hwbvphobuy",
            // content: "HEllo",
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
        {   
            messageId: 4,
            authorName: "Macron", 
            content: "Hello",
        },
        {   
            messageId: 5,
            authorName: "Poutine", 
            content: "Hellooo",
        },
        {   
            messageId: 6,
            authorName: "Coluche", 
            content: "Hello",
        },
        {   
            messageId: 7,
            authorName: "Macron", 
            content: "Hello",
        },
        {   
            messageId: 8,
            authorName: "Poutine", 
            content: "Hellooo",
        },
        {   
            messageId: 9,
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

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [ containerRef, channel1 ]);

    return (
        chanOrDm === 'channel' && currentChannel === 1 ?
            <div className="displayMessageClass">
                {channel1.map(msg => (
                    <div key={msg.messageId} className="userBubble">
                        <p className="userNameBubble">{msg.authorName}</p>
                        <p className="userConvBubble">{msg.content}</p>
                    </div>
                ))}
                {channel1.map(msg => (
                    <div key={msg.messageId} className="otherBubble">
                        <p className="otherNameBubble">{msg.authorName}</p>
                        <p className="otherConvBubble">{msg.content}</p>
                    </div>
                ))}
            </div>
        :
        ''
    );
};

export default DisplayMessages;