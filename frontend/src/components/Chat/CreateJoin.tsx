import React from "react";
import { useState } from "react";
import { useMutation } from "react-query";

import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";
import { joinChannel, addDm } from "../../api";
import './Chat.css';

const CreateJoin: React.FC = () => {
    const { isDm } = useContext(ChatContext) as ChatContextType;

    const [channelName, setChannelName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");


    const joinChannelMutation = useMutation({
        mutationFn: joinChannel,
        onError(e: AxiosError) {
            alert("Choose a more secured password or a valid channel name");
        }
    });

    const addDmMutation = useMutation({
        mutationFn: addDm,
        onError(e: AxiosError) {
            alert("Choose a more secured password or a valid channel name");
        }
    });

    // const createChannelMutation = useMutation({
    //     mutationFn: createChannel,
    //     onError(e: AxiosError) {
    //         alert("Choose a more secured password or a valid channel name");
    //     }
    // });

    const handleSubmitJoin = (event) => {
        event.preventDefault();
        // Handle form submission here
        joinChannelMutation.mutate({ channelName, password });
        //createChannelMutation.mutate({ name, password });
        console.log("name", name, "password", password);
    };

    const handleSubmitAdd = (event) => {
        event.preventDefault();
        // Handle form submission here
        addDmMutation.mutate({ targetName: userName });
        console.log(userName);
    };

    return (
        <div style={{height: "100%"}} className="CreateJoin">
            {!isDm ?
                <form onSubmit={handleSubmitJoin} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        style={{ flex: "1 1 auto" }}
                        placeholder="name"
                        className="inputClass"
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
                    />
                    <button type="submit" style={{ flex: "1 1 auto" }} className="submitClass">ADD</button>
                </form>
            }
        </div>
    );
};

export default CreateJoin;