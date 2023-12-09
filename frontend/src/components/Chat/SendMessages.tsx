import { useContext, useState } from "react";
import SocketContext from "../Socket/Context/Context";
import { ChatContext } from "../../contexts/ChatContext";
import { ChatContextType } from "./Menu";


const SendMessages: React.FC = () => {
    const inputStyle: React.CSSProperties = {
        width: "60%",
        height: "30%",
        display: "flex",
    };
    const { currentChannel, currentDm, chanOrDm } = useContext(ChatContext) as ChatContextType;
    const { SocketState } = useContext(SocketContext);
    const [message, setMessage] = useState<string>("");

    const handleSubmitMessage = (event: React.FormEvent) => {
        event.preventDefault();
        if (chanOrDm === "channel")
            SocketState.socket?.emit("channelmessage", {channelId: currentChannel, message: message});
        else if (chanOrDm === "dm")
            SocketState.socket?.emit("privatemessage", {targetId: currentDm, message: message});
        console.log("submitted message", message);
    };
  
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
            <form onSubmit={handleSubmitMessage} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <input
                    style={inputStyle}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="msg"
                />
                <button type="submit" style={{ flex: "1 1 auto" }}>SEND</button>
            </form>
        </div>
    );
};

export default SendMessages;
