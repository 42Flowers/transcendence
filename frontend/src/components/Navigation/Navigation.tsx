import { Avatar, Divider, List, ListItem, ListItemButton, ListItemText, Popover, Stack } from "@mui/material";
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import default_avatar from "../../assets/images/default_avatar.png";
import { useAuthContext } from "../../contexts/AuthContext";
import { AvatarContext } from "../../contexts/AvatarContext";
import './Navigation.css';
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SocketContext from "../Socket/Context/Context";
import './Navigation.css';
import MemoizedPopUpInvite from "../PopUpInvite/PopUpInvite";

const Navigation: React.FC = () => {
    const avatarRef = React.useRef<HTMLDivElement>(null);
    const [ isOpen, setOpen ] = React.useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [ senderPseudo, setSenderPseudo ] = useState<string>("");
    const { signOut } = useAuthContext();
    const { SocketState } = useContext(SocketContext);

    const launchNormal = useCallback(() => {
        navigate('/game-normal');
    }, [ navigate ]);

    const launchSpecial = useCallback(() => {
        navigate('/game-special');
    }, [ navigate ]);

    const [popup, setPopup] = useState(false);

    const showPopup = React.useCallback((pseudo: string) => {
        setPopup(true);
        setSenderPseudo(pseudo);
    }, [ setPopup, setSenderPseudo ]);

    useEffect(() => {
        SocketState.socket?.on("showGameInvite", showPopup);
        SocketState.socket?.on("launchNormal", launchNormal);
        SocketState.socket?.on("launchSpecial", launchSpecial);
        
        return () => {
            SocketState.socket?.off("showGameInvite", showPopup);
            SocketState.socket?.off("launchNormal", launchNormal);
            SocketState.socket?.off("launchSpecial", launchSpecial);
        };
    }, [SocketState.socket, launchNormal, launchSpecial, showPopup ]);

    const { avatar } = useContext(AvatarContext);

    const handleAvatarClick = () => {
        setOpen(true);
    };

    const handleAvatarClose = () => {
        setOpen(false);
    };

    /* Close popover on url change */
    React.useEffect(() => setOpen(false), [ location ]);

    const onAccept = () => {
        SocketState.socket?.emit('joinInviteGame');
        setPopup(false);
    };

    const onDecline = () => {
        SocketState.socket?.emit('declineGameInvitation');
        setPopup(false);
    };

    const id: string | undefined = isOpen ? "menu-popover" : undefined;

    const avatarSource = avatar ? `/static/${avatar}` : default_avatar;

    return (
        <>
            <div className="overlay" style={{ display: popup ? 'block': 'none' }}></div>
            { popup && <MemoizedPopUpInvite userName={senderPseudo} onAccept={onAccept} onDecline={onDecline} />}
            <Stack direction="row" justifyContent="space-between" alignItems="center" style={{padding: '5px'}}>
                <Link to="/" className="logo">
                    PONG
                </Link>
                <div ref={avatarRef}>
                    <Avatar aria-describedby={id} alt="Avatar" onClick={handleAvatarClick} src={avatarSource} style={{margin: '5px 10px'}}/>
                </div>
            </Stack>

            <Popover
                id={id}
                open={isOpen}
                anchorEl={avatarRef.current}
                onClose={handleAvatarClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
                sx={{
                    '& .MuiPopover-paper': {
                        backgroundColor: '#F8A38B',
                        borderLeft: '3px solid #9747FF',
                        borderBottom: '3px solid #9747FF',
                        borderRadius: '20px',
                    }
                }}
            >
                <List disablePadding>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/profile">
                            <ListItemText primary="Profile" />
                        </ListItemButton>
                    </ListItem>

                    <Divider />

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/friends">
                            <ListItemText primary="Friends" />
                        </ListItemButton>
                    </ListItem>

                    <Divider />

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/chat">
                            <ListItemText primary="Chat" />
                        </ListItemButton>
                    </ListItem>

                    <Divider />

                    <ListItem disablePadding>
                        <ListItemButton onClick={signOut}>
                            <ListItemText primary="Log Out" />
                        </ListItemButton>
                    </ListItem>

                </List>
            </Popover>
        </>
    );
}

export default Navigation;
