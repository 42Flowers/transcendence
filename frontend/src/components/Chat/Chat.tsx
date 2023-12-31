import React, { useCallback } from "react";
import CreateJoin from "./CreateJoin";
import DisplayMessages from "./DisplayMessages";
import List from "./List";
import Menu from "./Menu";
import SendMessages from "./SendMessages";
import Title from "./Title";

import { useContext } from "react";
import { ChatContext, ChatContextType } from "../../contexts/ChatContext";

import filter from 'lodash/filter';
import map from 'lodash/map';
import { ChannelDescription, ChannelMembership } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import { queryClient } from "../../query-client";
import { useSocketEvent } from "../Socket/Context/Context";
import './Chat.scss';

interface infoElem {
    type: string,
    msg: string
}

export type UserLeftChannelPayload = {
    channelId: number;
    userId: number;
}

export type UserJoinedChannelPayload = {
    channelId: number;
    userId: number;
    avatar: string;
    pseudo: string;
}

export type UpdateMemberPrivilegesPayload = {
    channelId: number;
    userId: number;
    permissionMask: number;
};

const Chat: React.FC = () => {
    const { isDm } = useContext(ChatContext) as ChatContextType;
    const auth = useAuthContext();
    const currentUserId = auth.user?.id;

    useSocketEvent<UserLeftChannelPayload>('user.left.channel', ({ channelId, userId }) => {
        const queryKey = [ 'channel-members', channelId ];
    
        /* If the channel is loaded */
        if (queryClient.getQueryData(queryKey) !== undefined) {
            queryClient.setQueryData<ChannelMembership[]>(queryKey, members =>
                filter(members, ({ userId: memberId }) => memberId !== userId));
        }
    });

    useSocketEvent<UpdateMemberPrivilegesPayload>('member.update.privileges', ({ channelId: updatedChannelId, permissionMask: newPermissionMask, userId: targetId }) => {
        if (targetId === currentUserId) {
            if (queryClient.getQueryData([ 'channels-list' ]) !== undefined) {
                queryClient.setQueryData<ChannelDescription[]>([ 'channels-list'], channels => map(channels, ({ channelId, userPermissionMask, ...rest }) => ({
                    channelId,
                    userPermissionMask: (channelId === updatedChannelId) ? newPermissionMask : userPermissionMask,
                    ...rest,
                })));
            }
        } else {
            const queryKey = [ 'channel-members', updatedChannelId ];
    
            /* If the channel is loaded */
            if (queryClient.getQueryData(queryKey) !== undefined) {
                queryClient.setQueryData<ChannelMembership[]>(queryKey, members => map(members, ({ userId, permissionMask, ...rest }) => ({
                    userId,
                    permissionMask: (userId === targetId) ? newPermissionMask : permissionMask,
                    ...rest,
                })));
            }
        }
    }, [ currentUserId ]);

    useSocketEvent<UserJoinedChannelPayload>('user.joined.channel', ({ channelId, userId, avatar, pseudo }) => {
        const queryKey = [ 'channel-members', channelId ];
    
        /* If the channel is loaded */
        if (queryClient.getQueryData(queryKey) !== undefined) {
            queryClient.setQueryData<ChannelMembership[]>(queryKey, members => [
                ...filter(members, ({ userId: memberId }) => memberId !== userId),
                {
                    membershipState: 1,
                    permissionMask: 1,
                    userId,
                    avatar,
                    userName: pseudo,
                }
            ]);
        }
    });

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        height: "80vh",
        minHeight: 150,
        textAlign: "center"
    };

    const containerStyleSides: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        height: "100%",
    };
       
    const containerWideStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: isDm ? "80%" : "60%", 
        maxWidth: isDm ? "80%" : "60%", 
    };

    const itemStyle: React.CSSProperties = {
        flex: 1,
    };

    // Left
    const menuLeftStyle: React.CSSProperties = {
        flex: "0 0 10%",
    };
       
    const listLeftStyle: React.CSSProperties = {
        flex: "0 0 75%",
        border: "2px solid white",
        overflow: "hidden",
    };
       
    const createJoinStyle: React.CSSProperties = {
        flex: "0 0 15%",
    };

    // Center
    const titleStyle: React.CSSProperties = {
        flex: "0 0 10%",
    };

    const displayStyle: React.CSSProperties = {
        flex: "0 0 75%",
        border: "2px solid white",
        overflow: "hidden",
        overflowY: "scroll",
    };
       
    const sendStyle: React.CSSProperties = {
        flex: "0 0 15%",
    };

    // Right
    const menuRightStyle: React.CSSProperties = {
        flex: "0 0 10%",
    };
       
    const listRightStyle: React.CSSProperties = {
        flex: "0 0 90%",
        border: "2px solid white",
        borderBottomRightRadius: "20px",
        overflow: "hidden",
    };

    const displayInfo = useCallback((msg: infoElem) => {
        alert(msg.msg);
    }, []);

    useSocketEvent<infoElem>('info', displayInfo);

    return (
        <div style={containerStyle}>
            <div style={itemStyle}>
                <div style={containerStyleSides}>
                    <div style={menuLeftStyle}>
                        <Menu side='left' />
                    </div>
                    <div style={listLeftStyle}>
                        <List side='left' />
                    </div>
                    <div style={createJoinStyle}>
                        <CreateJoin />
                    </div>
                </div>
            </div>
            <div style={containerWideStyle}>
                <div style={titleStyle}>
                    <Title />
                </div>
                <div style={displayStyle}>
                    <DisplayMessages />
                </div>
                <div style={sendStyle}>
                    <SendMessages />
                </div>
            </div>
            {!isDm && (
                <div style={itemStyle}>
                    <div style={containerStyleSides}>
                        <div style={menuRightStyle}>
                            <Menu side='right' />
                        </div>
                        <div style={listRightStyle}>
                            <List side='right' />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
