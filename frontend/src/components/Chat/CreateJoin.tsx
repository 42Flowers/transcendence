import React from "react";
import { useState } from "react";
import { useMutation } from "react-query";

import { ChatContext, ChatContextType } from "../../contexts/ChatContext";
import { useContext } from "react";
import { joinChannel, addDm, createPrivateChannel } from "../../api";
import './Chat.css';

const CreateJoin: React.FC = () => {
    const { isDm, isPrivate, setIsPrivate } = useContext(ChatContext) as ChatContextType;

    const [channelName, setChannelName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");


    const joinChannelMutation = useMutation({
        mutationFn: joinChannel,
        onError() {
            alert("Choose a more secured password or a valid channel name");
        }
    });

    const addDmMutation = useMutation({
        mutationFn: addDm,
        onError() {
            alert("Choose a more secured password or a valid channel name");
        }
    });

    const createPrivateChannelMutation = useMutation({
        mutationFn: createPrivateChannel,
        onError() {
            alert("Choose a valid channel name")
        }
    })

    const handleSubmitJoin = (event: React.FormEvent<HTMLFormElement>) => {
		if (channelName.length < 3)
			return;
        event.preventDefault();
        joinChannelMutation.mutate({ channelName, password });
		setChannelName('');
		setPassword('');
    };

    const handleSubmitInvite = (event: React.FormEvent<HTMLFormElement>) => {
        //
        //  TO DO
        //
		if (channelName.length < 3)
			return;
        event.preventDefault();
        createPrivateChannelMutation.mutate({ channelName });
		setChannelName('');
    };

    const handleSubmitAdd = (event: React.FormEvent<HTMLFormElement>) => {
		if (userName.length < 3)
			return;
        event.preventDefault();
        addDmMutation.mutate({ targetName: userName });
		setUserName('');
    };

    return (
        <div style={{height: "100%"}} className="CreateJoin">
            {!isDm ?
                !isPrivate
                    ?
                        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <form onSubmit={handleSubmitInvite} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                <button type="submit" style={{ flex: "1 1 auto" }} className="submitClassChangePrivate" onClick={() => { setIsPrivate(true); }}>Change to Private</button>
                            </form>
                            <form onSubmit={handleSubmitJoin} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                <input
                                    type="text"
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    style={{ flex: "1 1 auto" }}
                                    placeholder="name"
                                    className="inputClass"
                                    minLength={3}
                                    maxLength={10}
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ flex: "1 1 auto" }}
                                    placeholder="password"
                                    className="inputClass"
                                    maxLength={20}
                                />
                                <button type="submit" style={{ flex: "1 1 auto" }} className="submitClass">JOIN</button>
                            </form>
                        </div>
                    :
                        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <form onSubmit={handleSubmitInvite} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                <button type="submit" style={{ flex: "1 1 auto" }} className="submitClassChangePrivate" onClick={() => { setIsPrivate(false); }}>Change to Public</button>
                            </form>
                            <form onSubmit={handleSubmitInvite} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                <input
                                    type="text"
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    style={{ flex: "1 1 auto" }}
                                    placeholder="name"
                                    className="inputClass"
                                    minLength={3}
                                    maxLength={10}
                                />
                                <button type="submit" style={{ flex: "1 1 auto" }} className="submitClass">JOIN</button>
                            </form>
                    </div>
            :
                <form onSubmit={handleSubmitAdd} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{ flex: "1 1 auto" }}
                        placeholder="name"
                        className="inputClass"
                        maxLength={10}
						minLength={3}
                    />
                    <button type="submit" style={{ flex: "1 1 auto" }} className="submitClass">ADD</button>
                </form>
            }
        </div>
    );
};

export default CreateJoin;