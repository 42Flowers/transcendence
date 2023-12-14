import { useContext, useState } from "react";
import SocketContext from "../Socket/Context/Context";
import { ChatContext } from "../../contexts/ChatContext";
import { AiOutlineSend } from 'react-icons/ai';

const SendMessages: React.FC = () => {
    const inputStyle: React.CSSProperties = {
        width: "60%",
        height: "30%",
        display: "flex",
        marginRight: "5%",
    };
    const { currentChannel, currentDm, chanOrDm } = useContext(ChatContext);
    const { socket } = useContext(SocketContext);
    const [message, setMessage] = useState<string>("");

    const handleSubmitMessage = (event: React.FormEvent) => {
        event.preventDefault();
		if (message.length < 1)
			return;
        if (chanOrDm === "channel")
            socket?.emit("channelmessage", {channelId: currentChannel, message: message});
        else if (chanOrDm === "dm")
            socket?.emit("privatemessage", {targetId: currentDm, message: message});
        setMessage("");
    };

    return (
        // <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <>
            { currentChannel !== 0 || currentDm !== 0
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
								minLength={1}
                            />
                            {/*<AiOutlineSend className="icon-send"/>*/}
                            {/* <button type="submit" style={{ flex: "1 1 auto" }}>SEND</button> */}
                            <button type="submit" style={{ background: "none", border: "none" }}><AiOutlineSend className="icon-send"/></button>
                        </form>
                    </div>
                :
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }} className="sendMessageClass"/>
                        // null
            }
        </>
    );
};

export default SendMessages;
