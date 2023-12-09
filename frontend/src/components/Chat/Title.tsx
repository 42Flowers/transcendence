import filter from 'lodash/filter';
import { useContext } from "react";
import { useMutation } from "react-query";
import { quit } from "../../api";
import { ChatContext } from "../../contexts/ChatContext";
import { queryClient } from "../../query-client";

const Title: React.FC = () => {
    const { currentChannel, setCurrentChannel } = useContext(ChatContext);

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

            /* Delete the channel from the list of channels */
            queryClient.setQueryData(['channels-list'], channels => filter(channels, ({ channelId }) => channelId !== currentChannel));
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
