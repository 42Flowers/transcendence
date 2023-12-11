import { useContext, useState } from "react";
import SocketContext from "../Socket/Context/Context";
import { ChatContext } from "../../contexts/ChatContext";
import { AiOutlineSend } from 'react-icons/ai';
import './Chat.css';

const SendMessages: React.FC = () => {
    const inputStyle: React.CSSProperties = {
        width: "60%",
        height: "30%",
        display: "flex",
        marginRight: "5%",
    };
    const { currentChannel, currentDm, chanOrDm } = useContext(ChatContext);
    const { SocketState } = useContext(SocketContext);
    const [message, setMessage] = useState<string>("");

    const handleSubmitMessage = (event: React.FormEvent) => {
        event.preventDefault();
        if (chanOrDm === "channel")
            SocketState.socket?.emit("channelmessage", {channelId: currentChannel, message: message});
        else if (chanOrDm === "dm")
            SocketState.socket?.emit("privatemessage", {targetId: currentDm, message: message});
        console.log("submitted message", message);
        setMessage("");
    };

    console.log("chan", currentChannel);
    console.log("dm", currentDm);
  
    return (
        // <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <>
            { currentChannel !== null || currentDm !== null
                ?
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }} className="sendMessageClass">
                        <form onSubmit={handleSubmitMessage} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", height: "100%", width: "100%"}}>
                            <input
                                style={inputStyle}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="msg"
                                className="inputSendMessageClass"
                                maxLength={100}
                            />
                            {/*<AiOutlineSend className="icon-send"/>*/}
                            {/* <button type="submit" style={{ flex: "1 1 auto" }}>SEND</button> */}
                            <button type="submit" style={{ background: "none", border: "none" }}><AiOutlineSend className="icon-send"/></button>
                        </form>
                    </div>
                :
                    null
            }
        </>
    );
};

export default SendMessages;
