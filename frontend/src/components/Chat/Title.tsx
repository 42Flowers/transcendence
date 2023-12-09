import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType} from "./Menu";

import { quit } from "../../api";
import { useMutation } from "react-query";

const Title: React.FC = () => {
    const { currentChannel, setCurrentChannel } = useContext(ChatContext) as ChatContextType;

    const titleStyle: React.CSSProperties = {
        width: "70%",
        height: "100%",
        backgroundColor: "transparent",
        border: "1px solid red",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const buttonStyle: React.CSSProperties = {
        width: "30%",
        height: "100%",
        backgroundColor: "transparent",
        cursor: "pointer",
        border: "1px solid red",
    };

    const quitMutation = useMutation({
        mutationFn: quit,
        onSuccess(data) {
            setCurrentChannel(null);
        },
        onError(e: AxiosError) {
            alert("Cannot quit");
        }
    });

    const handleQuit = (event) => {
        event.preventDefault();
        console.log("channelId", currentChannel);
        quitMutation.mutate({ channelId: currentChannel });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
           <p style={titleStyle}>ChannelName</p>
           <button style={buttonStyle} onClick={handleQuit}>QUIT</button>
       </div>
    );
};

export default Title;
