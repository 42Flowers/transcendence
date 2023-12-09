import React from "react";
import Menu from "./Menu";
import List from "./List";
import CreateJoin from "./CreateJoin";
import Title from "./Title";
import DisplayMessages from "./DisplayMessages";
import SendMessages from "./SendMessages";

import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import { ChatContextType } from "./Menu";

const Chat2: React.FC = () => {
    const { isDm } = useContext(ChatContext) as ChatContextType;

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        height: "80vh",
        minHeight: 150,
        // border: "1px solid black",
        // border: "1px solid white",
        // borderRadius: "20px",
        // fontSize: 30,
        textAlign: "center",
        // fontFamily: "Short Stack",
    };

    const containerStyleSides: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        // height: "80vh",
        height: "100%",
    };
       
    const containerWideStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        // height: "80vh",
        height: "100%",
        minWidth: isDm ? "80%" : "60%", 
    };

    const itemStyle: React.CSSProperties = {
        flex: 1,
        // border: "1px solid red",
    };

    // Left
    const menuLeftStyle: React.CSSProperties = {
        flex: "0 0 10%",
        // border: "1px solid red",
    };
       
    const listLeftStyle: React.CSSProperties = {
        flex: "0 0 75%",
        // border: "1px solid red",
        border: "2px solid white",
        overflow: "hidden",
    };
       
    const createJoinStyle: React.CSSProperties = {
        flex: "0 0 15%",
        // border: "1px solid red",
        // borderBottomLeftRadius: "20px",
    };

    // Center
    const titleStyle: React.CSSProperties = {
        flex: "0 0 10%",
        // border: "1px solid red",
    };

    const displayStyle: React.CSSProperties = {
        flex: "0 0 75%",
        // border: "1px solid red",
        border: "2px solid white",
        // flexDirection: "column-reverse",
        overflow: "hidden",
        overflowY: "scroll",
    };
       
    const sendStyle: React.CSSProperties = {
        flex: "0 0 15%",
        // border: "1px solid red",
    };

    // Right
    const menuRightStyle: React.CSSProperties = {
        flex: "0 0 10%",
        // border: "1px solid red",
    };
       
    const listRightStyle: React.CSSProperties = {
        flex: "0 0 90%",
        // border: "1px solid red",
        border: "2px solid white",
        borderBottomRightRadius: "20px",
        overflow: "hidden",
    };

    // const containerStyle: React.CSSProperties = {
    //     display: "flex",
    //     flexDirection: "row",
    //     height: "80vh",
    //     minHeight: 150,
    //     border: "1px solid black",
    //     fontSize: 30,
    //     textAlign: "center"
    // };

    // const containerStyleSides: React.CSSProperties = {
    //     display: "flex",
    //     flexDirection: "column",
    //     height: "80vh",
    // };
       
    // const containerWideStyle: React.CSSProperties = {
    //     display: "flex",
    //     flexDirection: "column",
    //     minWidth: isDm ? "80%" : "60%", 
    // };

    // const itemStyle: React.CSSProperties = {
    //     flex: 1,
    //     border: "1px solid red",
    // };

    // // Left
    // const menuLeftStyle: React.CSSProperties = {
    //     flex: "0 0 15%",
    //     border: "1px solid red",
    // };
       
    // const listLeftStyle: React.CSSProperties = {
    //     flex: "0 0 65%",
    //     border: "1px solid red",
    // };
       
    // const createJoinStyle: React.CSSProperties = {
    //     flex: "0 0 20%",
    //     border: "1px solid red",
    // };

    // // Center
    // const titleStyle: React.CSSProperties = {
    //     flex: "0 0 15%",
    //     border: "1px solid red",
    // };

    // const displayStyle: React.CSSProperties = {
    //     flex: "0 0 65%",
    //     border: "1px solid red",
    // };
       
    // const sendStyle: React.CSSProperties = {
    //     flex: "0 0 20%",
    //     border: "1px solid red",
    // };

    // // Right
    // const menuRightStyle: React.CSSProperties = {
    //     flex: "0 0 15%",
    //     border: "1px solid red",
    // };
       
    // const listRightStyle: React.CSSProperties = {
    //     flex: "0 0 65%",
    //     border: "1px solid red",
    // };

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

export default Chat2;