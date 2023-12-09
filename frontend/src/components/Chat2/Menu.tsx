import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import './Chat.css';

export interface ChatContextType {
    chanOrDm: string
    setChanOrDm: (chanOrDm: string) => void;
    usersOrBanned: string
    setUsersOrBanned: (usersOrBanned: string) => void;
    isDm: boolean
    setIsDm: (isDm: boolean) => void;
    currentChannel: number
    setCurrentChannel: (currentChannel: number) => void;
    currentDm: number
    setCurrentDm: (currentDm: number) => void;
}

type Props = {
    side: string
}

const Menu: React.FC<Props> = ({ side }) => {
    const { setChanOrDm, setUsersOrBanned, setIsDm } = useContext(ChatContext) as ChatContextType;

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