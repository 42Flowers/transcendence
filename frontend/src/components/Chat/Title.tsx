import filter from 'lodash/filter';
import { useContext } from "react";
import { useMutation } from "react-query";
import { deleteM, quit } from "../../api";
import { ChatContext } from "../../contexts/ChatContext";
import { queryClient } from "../../query-client";
import './Chat.css';

const Title: React.FC = () => {
    const { chanOrDm, currentChannel, setCurrentChannel, currentChannelName, myPermissionMask } = useContext(ChatContext);

    const titleStyle: React.CSSProperties = {
        width: "70%",
        height: "100%",
        backgroundColor: "transparent",
        // border: "1px solid red",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const buttonStyle: React.CSSProperties = {
        width: "30%",
        height: "100%",
        backgroundColor: "transparent",
        cursor: "pointer",
        // border: "1px solid red",
        border: "none",
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

    const deleteMutation = useMutation({
        mutationFn: deleteM,
        onSuccess(data) {
            setCurrentChannel(null);
            /* Delete the channel from the list of channels */
            queryClient.setQueryData(['channels-list'], channels => filter(channels, ({ channelId }) => channelId !== currentChannel));
        },
        onError(e: AxiosError) {
            alert("Cannot delete");
        }
    });

    const handleQuit = (event) => {
        event.preventDefault();
        quitMutation.mutate({ channelId: currentChannel });
    };

    const handleDelete = (event) => {
        event.preventDefault();
        //quitMutation.mutate({ channelId: currentChannel });
        deleteMutation.mutate({ channelId: currentChannel });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }} className="titleClass">
            { chanOrDm === 'channel' 
                ?
                    <>
                        <p style={titleStyle}>{currentChannelName}</p>
                        { myPermissionMask === 4 
                            ?
                                <button style={buttonStyle} className="buttonClass" onClick={handleDelete}>DELETE</button>
                            :
                                <button style={buttonStyle} className="buttonClass" onClick={handleQuit}>QUIT</button>
                        }
                    </>
                :
                    <>
                        <p>hello</p>
                    </>
            }
       </div>
    );
};

export default Title;
