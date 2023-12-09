import React from "react";
import { useState } from "react";
import './Chat.css';

import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";

const CreateJoin: React.FC = () => {
    const { isDm } = useContext(ChatContext) as ChatContextType;

    const [input1, setInput1] = useState("");
    const [input2, setInput2] = useState("");

    const handleSubmitJoin = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle form submission here
        console.log(input1, input2);
    };

    const handleSubmitAdd = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle form submission here
        console.log(input1);
    };

    return (
        <div style={{height: "100%"}} className="CreateJoin">
            {!isDm ?
                <form onSubmit={handleSubmitJoin} style={{ display: "flex", flexDirection: "column", height: "100%",}}>
                    <input
                        type="text"
                        value={input1}
                        onChange={(e) => setInput1(e.target.value)}
                        style={{ flex: "1 1 auto" }}
                        placeholder="name"
                        className="inputClass"
                    />
                    <input
                        type="password"
                        value={input2}
                        onChange={(e) => setInput2(e.target.value)}
                        style={{ flex: "1 1 auto" }}
                        placeholder="password"
                        className="inputClass"
                    />
                    <button type="submit" style={{ flex: "1 1 auto" }} className="submitClass">JOIN</button>
                </form>
            :
                <form onSubmit={handleSubmitAdd} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <input
                        type="text"
                        value={input1}
                        onChange={(e) => setInput1(e.target.value)}
                        style={{ flex: "1 1 auto", justifyContent: "center", alignItems: "center", }}
                        placeholder="name"
                        className="inputClass"
                    />
                    {/* <button type="submit" style={{ flex: "1 1 auto" }}>ADD</button> */}
                    <button type="submit" style={{ flex: "1 1 auto" }} className="submitClass">ADD</button>
                </form>
            }
        </div>
    );
};

export default CreateJoin;