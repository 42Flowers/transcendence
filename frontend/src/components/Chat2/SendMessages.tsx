import classNames from 'classnames';
import './Chat.css';
import { AiOutlineSend } from 'react-icons/ai';

const SendMessages: React.FC = () => {
    const inputStyle: React.CSSProperties = {
        width: "60%",
        height: "30%",
        display: "flex",
        marginRight: "5%",
    };
  
    return (
        // <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }} className="sendMessageClass">
            <input style={inputStyle} className="inputSendMessageClass"/>
            <AiOutlineSend className="icon-send"/>
        </div>
    );
};

export default SendMessages;