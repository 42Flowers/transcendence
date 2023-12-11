import filter from 'lodash/filter';
import { useContext, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { addPwd, changePwd, deleteM, deletePwd, quit, fetchAvailableDMs, fetchAvailableUsers } from "../../api";
import { queryClient } from "../../query-client";
import map from 'lodash/map';
import { ChatContext, ChatContextType  } from "../../contexts/ChatContext";

import './Chat.css';
import { useAuthContext } from '../../contexts/AuthContext';
import AvatarOthers from '../AvatarOthers/AvatarOthers';
import default_avatar from '../../assets/images/default_avatar.png';

type DisplayProps = {
    myId: number
    userId: number
    userName: string
    avatar: string | null
    userPermissionMask?: number
    myPermissionMask?: number
    currentChannel?: number
    memberShipState?: number
}

const DisplayUser: React.FC<DisplayProps> = ({ myId, userId, userName, avatar }) => {
    const [availability, setAvailability] = useState<string>('');
    const buttonStyle: React.CSSProperties = {
        width: "30%",
        height: "100%",
        backgroundColor: "transparent",
        cursor: "pointer",
        border: "none",
    };
    const usersQuery = useQuery(['available-users'], fetchAvailableUsers, {
        onSuccess: (data) => {
            data.map(([ id, pseudo, availability ]) => {
                if (userId === id) {
                    setAvailability(availability);
                }
            });
        }
    });

    const handlePlay = (event) => {
        // event.preventDefault();
        // deletePasswordMutation.mutate({ channelId: currentChannel });
    };
    
    return (
        <div className='titleDMChildChild'>
            <div className="avatarCursorPointer">
                <AvatarOthers
                    status={availability}
                    avatar={avatar ? `http://localhost:3000/static/${avatar}` : default_avatar}
                    userId={userId} />
            </div>
            <p>{userName}</p>
            <button style={buttonStyle} className="buttonClassPurple" onClick={handlePlay}>PLAY</button>
        </div>
    );
}

const Title: React.FC = () => {
    const { chanOrDm, currentChannel, setCurrentChannel, currentChannelName, setCurrentChannelName, myPermissionMask, currentAccessMask, setCurrentAccessMask, currentDm, setCurrentDm, currentAvatar, setCurrentAvatar, } = useContext(ChatContext);
    const directMessages = useQuery('direct-messages-list', fetchAvailableDMs);

    const [addPassword, setAddPassword] = useState("");
    const [changePassword, setChangePassword] = useState("");
    const auth = useAuthContext();

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

    const addPasswordMutation = useMutation({
        mutationFn: addPwd,
        onError(e: AxiosError) {
            alert("Cannot add password");
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: changePwd,
        onError(e: AxiosError) {
            alert("Cannot change password");
        }
    });

    const deletePasswordMutation = useMutation({
        mutationFn: deletePwd,
        onError(e: AxiosError) {
            alert("Cannot delete password");
        }
    });

    const handleQuit = (event) => {
        event.preventDefault();
        quitMutation.mutate({ channelId: currentChannel });
    };

    const handleDelete = (event) => {
        event.preventDefault();
        deleteMutation.mutate({ channelId: currentChannel });
    };

    const handleAddPassword = (event) => {
        event.preventDefault();
        addPasswordMutation.mutate({ channelId: currentChannel, pwd: addPassword });
    };

    const handleChangePassword = (event) => {
        event.preventDefault();
        changePasswordMutation.mutate({ channelId: currentChannel, pwd: changePassword });
    };

    const handleDeletePassword = (event) => {
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
                                <div style={{ display: 'flex', justifyContent: 'center'}} className='channelPasswordHandle'>
                                    { currentAccessMask === 1 
                                        ?
                                            <form onSubmit={handleAddPassword} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                <input
                                                    type="text"
                                                    placeholder="add a password"
                                                    value={addPassword}
                                                    onChange={(e) => setAddPassword(e.target.value)}
                                                    style={{ flex: "1 1 auto" }}
                                                    className='channelPasswordInput'
                                                />
                                                <button type="submit" style={{ flex: "1 1 auto" }} className='channelPasswordButton' >Add password</button>
                                            </form>
                                        :
                                            <>
                                                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                    <input
                                                        type="text"
                                                        placeholder="new password"
                                                        value={changePassword}
                                                        onChange={(e) => setChangePassword(e.target.value)}
                                                        style={{ flex: "1 1 auto" }}
                                                        className='channelPasswordInputBis'
                                                    />
                                                    <button type="submit" style={{ flex: "1 1 auto" }} className='channelPasswordButtonBis' >Change password</button>
                                                </form>
                                                <button style={{ flex: "1 1 auto" }} onClick={handleDeletePassword} className='channelPasswordButtonBisEnd' >Remove Password</button>
                                            </>
                                    }
                                </div>
                            :
                                null
                        }
                        { myPermissionMask === 4 
                            ?
                                <button style={buttonStyle} className="buttonClassPurple" onClick={handleDelete}>Delete Channel</button>
                            :
                                <button style={buttonStyle} className="buttonClassPurple" onClick={handleQuit}>Quit Channel</button>
                        }
                    </>
                :
                    chanOrDm === "dm" && currentDm !== null
                        ?
                            <div className="titleDM">
                                {directMessages.isFetched && map(directMessages.data, dm => (
                                    dm.targetId === currentDm
                                        ?
                                            <div key={dm.targetId} className="titleDMChild" onClick={() => {
                                                setCurrentDm(dm.targetId)
                                                setCurrentAvatar(dm.avatar)
                                            }}>
                                                <DisplayUser myId={auth.user.id} userId={dm.targetId} userName={dm.targetName} avatar={dm.avatar} />
                                            </div>
                                        :
                                            null
                                ))}
                            </div>
                        :
                            null
           }
       </div>
    );
};

export default Title;
