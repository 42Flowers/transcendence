import React, { useCallback, useEffect, useState } from "react";
import Menu from "./Menu";
import List from "./List";
import CreateJoin from "./CreateJoin";
import Title from "./Title";
import DisplayMessages from "./DisplayMessages";
import SendMessages from "./SendMessages";

import { ChatContext, ChatContextType } from "../../contexts/ChatContext";
import { useContext } from "react";

import SocketContext, { useSocketEvent } from "../Socket/Context/Context";
import { queryClient } from "../../query-client";
import { ChannelMembership } from "../../api";
import filter from 'lodash/filter';

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

const Chat: React.FC = () => {
    const { isDm } = useContext(ChatContext) as ChatContextType;
    const { SocketState } = useContext(SocketContext);

    useSocketEvent<UserLeftChannelPayload>('user.left.channel', ({ channelId, userId }) => {
        const queryKey = [ 'channel-members', channelId ];
    
        /* If the channel is loaded */
        if (queryClient.getQueryData(queryKey) !== undefined) {
            queryClient.setQueryData<ChannelMembership[]>(queryKey, members =>
                filter(members, ({ userId: memberId }) => memberId !== userId));
        }
    });

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

    useEffect(() => {
        SocketState.socket?.on("info", displayInfo);

        return () => {
            SocketState.socket?.off("info", displayInfo);
        }
    }, [SocketState.socket]);

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
