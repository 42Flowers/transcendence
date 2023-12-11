import filter from 'lodash/filter';
import { useContext, useState } from "react";
import { useMutation } from "react-query";
import { addPwd, changePwd, deleteM, deletePwd, quit } from "../../api";
import { ChatContext } from "../../contexts/ChatContext";
import { queryClient } from "../../query-client";
import './Chat.css';

const Title: React.FC = () => {
    const { chanOrDm, currentChannel, setCurrentChannel, currentChannelName, myPermissionMask, currentAccessMask } = useContext(ChatContext);

    const [addPassword, setAddPassword] = useState("");
    const [changePassword, setChangePassword] = useState("");

    const titleStyle: React.CSSProperties = {
        width: "70%",
        height: "100%",
        backgroundColor: "transparent",
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

    interface Channel {
        channelId: number
    }

    const quitMutation = useMutation({
        mutationFn: quit,
        onSuccess() {
            setCurrentChannel(0);
            /* Delete the channel from the list of channels */
            queryClient.setQueryData(['channels-list'], (channels: Channel[] | undefined) => filter(channels, ({ channelId }: Channel) => channelId !== currentChannel));
        },
        onError() {
            alert("Cannot quit");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteM,
        onSuccess() {
            setCurrentChannel(0);
            /* Delete the channel from the list of channels */
            queryClient.setQueryData(['channels-list'], (channels: Channel[] | undefined) => 
                filter(channels, ({ channelId }: Channel) => channelId !== currentChannel));
        },
        onError() {
            alert("Cannot delete");
        }
    });

    const addPasswordMutation = useMutation({
        mutationFn: addPwd,
        onError() {
            alert("Cannot add password");
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: changePwd,
        onError() {
            alert("Cannot change password");
        }
    });

    const deletePasswordMutation = useMutation({
        mutationFn: deletePwd,
        onError() {
            alert("Cannot delete password");
        }
    });

    const handleQuit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        quitMutation.mutate({ channelId: currentChannel });
    };

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        deleteMutation.mutate({ channelId: currentChannel });
    };

    const handleAddPassword = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addPasswordMutation.mutate({ channelId: currentChannel, pwd: addPassword });
    };

    const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        changePasswordMutation.mutate({ channelId: currentChannel, pwd: changePassword });
    };

    const handleDeletePassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        deletePasswordMutation.mutate({ channelId: currentChannel });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }} className="titleClass">
            { chanOrDm === 'channel' && currentChannel !== null
                ?
                    <>
                        <p style={titleStyle}>{currentChannelName}</p>
                        { myPermissionMask === 4 
                            ?
                                <div style={{ display: 'flex', justifyContent: 'center'}}>
                                    { currentAccessMask === 1 
                                        ?
                                            <form onSubmit={handleAddPassword} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                <input
                                                    type="text"
                                                    placeholder="add a password"
                                                    value={addPassword}
                                                    onChange={(e) => setAddPassword(e.target.value)}
                                                    style={{ flex: "1 1 auto" }}
                                                />
                                                <button type="submit" style={{ flex: "1 1 auto" }}>Add password</button>
                                            </form>
                                        :
                                            <>
                                                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                    <input
                                                        type="text"
                                                        placeholder="change password"
                                                        value={changePassword}
                                                        onChange={(e) => setChangePassword(e.target.value)}
                                                        style={{ flex: "1 1 auto" }}
                                                    />
                                                    <button type="submit" style={{ flex: "1 1 auto" }}>Change password</button>
                                                </form>
                                                <button style={{ flex: "1 1 auto" }} onClick={handleDeletePassword}>Remove Password</button>
                                            </>
                                    }
                                </div>
                            :
                                null
                        }
                        { myPermissionMask === 4 
                            ?
                                <button style={buttonStyle} className="buttonClass" onClick={handleDelete}>Delete Channel</button>
                            :
                                <button style={buttonStyle} className="buttonClass" onClick={handleQuit}>Quit Channel</button>
                        }
                    </>
                :
                    null
            }
       </div>
    );
};

export default Title;
