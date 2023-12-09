import './Chat.css';

const Title: React.FC = () => {
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

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }} className="titleClass">
           <p style={titleStyle} >ChannelName</p>
           <button style={buttonStyle} className="buttonClass">QUIT</button>
       </div>
    );
};

export default Title;