

const SendMessages: React.FC = () => {
    const inputStyle: React.CSSProperties = {
        width: "60%",
        height: "30%",
        display: "flex",
    };
  
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
            <input style={inputStyle} />
        </div>
    );
};

export default SendMessages;