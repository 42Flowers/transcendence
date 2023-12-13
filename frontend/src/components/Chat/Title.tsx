import filter from 'lodash/filter';
import map from 'lodash/map';
import React, { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { addPwd, changePwd, deleteM, deletePwd, fetchAvailableDMs, inviteUser, quit } from "../../api";
import { ChatContext } from "../../contexts/ChatContext";
import { queryClient } from "../../query-client";

import { useAuthContext } from '../../contexts/AuthContext';
import { UserAvatar } from "../UserAvatar";
import './Chat.css';
import SocketContext from '../Socket/Context/Context';

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
    const { SocketState } = useContext(SocketContext);
    const buttonStyle: React.CSSProperties = {
        width: "30%",
        height: "100%",
        backgroundColor: "transparent",
        cursor: "pointer",
        border: "none",
    };

    const handlePlay = (event) => {
        event.preventDefault();
        SocketState.socket?.emit("inviteNormal", userId);
    };

    return (
        <div className='titleDMChildChild'>
            <div className="avatarCursorPointer">
                <UserAvatar
                    userId={userId}
                    avatar={avatar} />
            </div>
            <p>{userName}</p>
            <button style={buttonStyle} className="buttonClassPurple" onClick={handlePlay}>PLAY</button>
        </div>
    );
}

const Title: React.FC = () => {
    const { chanOrDm, isPrivate, currentChannel, setCurrentChannel, currentChannelName, setCurrentChannelName, myPermissionMask, currentAccessMask, setCurrentAccessMask, currentDm, setCurrentDm, currentAvatar, setCurrentAvatar, } = useContext(ChatContext);
    const directMessages = useQuery('direct-messages-list', fetchAvailableDMs);

    const [addPassword, setAddPassword] = useState("");
    const [changePassword, setChangePassword] = useState("");
	const [invitedUser, setInvitedUser] = useState("");
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

    const addUserToChannel = useMutation({
        // TO DO
        // INVITE USER
        // mutationFn: addPwd,
        // onError() {
        //     alert("Cannot add user");
        // }
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

	const inviteUserMutation = useMutation({
		mutationFn: inviteUser, 
		onError() {
			alert("Cannot invite user");
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

    const handleInviteUser = (event: React.MouseEvent<HTMLButtonElement>) => {
		console.log(event);
        event.preventDefault();
		if (invitedUser.length < 3)
			return;
		inviteUserMutation.mutate({channelId: currentChannel, targetName: invitedUser});
		setInvitedUser('');
    };

    const handleAddPassword = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addPasswordMutation.mutate({ channelId: currentChannel, pwd: addPassword });
        setAddPassword('');
    };

    const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        changePasswordMutation.mutate({ channelId: currentChannel, pwd: changePassword });
        setChangePassword('');
    };

    const handleDeletePassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        deletePasswordMutation.mutate({ channelId: currentChannel });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }} className="titleClass">
            { chanOrDm === 'channel' && currentChannel !== 0
                ?
                    <>
                        <p style={titleStyle}>{currentChannelName}</p>
                        { myPermissionMask === 4 
                            ?  (
                                <div style={{ display: 'flex', justifyContent: 'center'}} className='channelPasswordHandle'>
                                    {/* {isPrivate */}
                                    {currentAccessMask === 2
                                        ?
                                            <form onSubmit={handleInviteUser} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                <input
                                                    type="text"
                                                    placeholder="add a user"
                                                    value={invitedUser}
                                                    onChange={(e) => setInvitedUser(e.target.value)}
                                                    style={{ flex: "1 1 auto" }}
                                                    className='channelPasswordInput'
                                                    minLength={3}
                                                />
                                                <button type="submit" style={{ flex: "1 1 auto" }} className='channelPasswordButton' >Invite</button>
                                            </form>
                                        :
                                            (currentAccessMask === 1 
                                                ?
                                                    <form onSubmit={handleAddPassword} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                        <input
                                                            type="text"
                                                            placeholder="add a password"
                                                            value={addPassword}
                                                            onChange={(e) => setAddPassword(e.target.value)}
                                                            style={{ flex: "1 1 auto" }}
                                                            className='channelPasswordInput'
                                                            minLength={3}
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
                                                    </>)
                                            }
                                </div>
                                )
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
                    chanOrDm === "dm" && currentDm !== 0
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
