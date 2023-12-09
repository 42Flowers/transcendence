import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import './Chat.css';

type Props = {
    side: string
}

const Menu: React.FC<Props> = ({ side }) => {
    const { setChanOrDm, setUsersOrBanned, setIsDm } = useContext(ChatContext);
    
    const buttonStyle: React.CSSProperties = {
        width: "50%",
        height: "100%",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer"
    };

    return (
        side === 'left'
            ?
                <div className="menuLeftClass">
                    <button style={buttonStyle} className="buttonClass" onClick={() => {
                        setChanOrDm('channel');
                        setIsDm(false);
                    }}
                    >
                        Channels</button>
                    <button style={buttonStyle} className="buttonClass" onClick={() => {
                        setChanOrDm('dm');
                        setIsDm(true);
                    }}
                    >
                        Direct Messages</button>
                </div>
            :
                <div className="menuRightClass">
                    <button style={buttonStyle} className="buttonClass" onClick={() => setUsersOrBanned('users')}>Users</button>
                    <button style={buttonStyle} className="buttonClass" onClick={() => setUsersOrBanned('banned')}>Banned Users</button>
                </div>
    );
};

export default Menu;
