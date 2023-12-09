import { useContext, useState } from "react";
import SocketContext from "../Socket/Context/Context";
import { ChatContext } from "../../contexts/ChatContext";
import { ChatContextType } from "./Menu";
import { AiOutlineSend } from 'react-icons/ai';
import './Chat.css';

const SendMessages: React.FC = () => {
    const inputStyle: React.CSSProperties = {
        width: "60%",
        height: "30%",
        display: "flex",
        marginRight: "5%",
    };
    const { currentChannel } = useContext(ChatContext) as ChatContextType;
    const { SocketState } = useContext(SocketContext);
    const [message, setMessage] = useState<string>("");

    const handleSubmitMessage = (event: React.FormEvent) => {
        event.preventDefault();
        SocketState.socket?.emit("channelmessage", {channelId: currentChannel, message: message});
        console.log("submitted message", message);
    };
  
    return (
        // <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }} className="sendMessageClass">
            <form onSubmit={handleSubmitMessage} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", height: "100%", width: "100%"}}>
                <input
                    style={inputStyle}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="msg"
                    className="inputSendMessageClass"
                />
                <AiOutlineSend className="icon-send"/>
                {/* <button type="submit" style={{ flex: "1 1 auto" }}>SEND</button> */}
            </form>
        </div>
    );
};

export default SendMessages;
