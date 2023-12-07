import React, { MouseEvent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Stack, Popover, List, ListItem, ListItemButton, ListItemText, Divider } from "@mui/material";
import default_avatar from "../../assets/images/default_avatar.png";
import { AvatarContext } from "../../contexts/AvatarContext";
import PopUpInvite from '../PopUpInvite/PopUpInvite.tsx';

import './Navigation.css';
import { useAuthContext } from "../../contexts/AuthContext";

interface Props {
    // onRouteChange: (route: string) => void;
    isSignedIn: boolean;
}

interface AvatarContextType {
    avatar: string;
    setAvatar: (avatar: string) => void;
}

const Navigation: React.FC<Props> = ({ isSignedIn }) => {
    const navigate = useNavigate();
    const [avatarEl, setAvatarEl] = React.useState<HTMLDivElement | null>(null);
    const { signOut } = useAuthContext();

    const { avatar } = useContext(AvatarContext) as AvatarContextType;

    const [popup, setPopup] = useState(false);

    const handleAvatarClick = (e: MouseEvent<HTMLDivElement>) => {
        setAvatarEl(e.currentTarget);
    };

    const handleAvatarClose = () => {
        setAvatarEl(null);
    };

    const showPopup = () => {
        setPopup(true);
    }

    useEffect(() => {
        // Lorsque event est reçu
            // showPopup();
            // récup le username de celui qui a envoyé l'invit
    }, []);

    const onAccept = () => {
        // TODO: 
            // Here
        setPopup(false);
    };

    const onDecline = () => {
        // TODO: 
            // Here
        setPopup(false);
    };

    const open = Boolean(avatarEl);
    const id: string | undefined = open ? "menu-popover" : undefined;
    /* if user is not signed in, no navigation*/
    if (!isSignedIn) {
        return (null);
    } else {
        return (
            <>
                <div className="overlay" style={{ display: popup ? 'block': 'none' }}></div>
                { popup && <PopUpInvite userName="USERNAME" onAccept={onAccept} onDecline={onDecline} />}
                <Stack direction="row" justifyContent="space-between" alignItems="center" style={{padding: '5px'}}>
                    <p onClick={() => navigate('/')} className="logo">
                        PONG
                    </p>
                    <Avatar aria-describedby={id} alt="Avatar" onClick={handleAvatarClick} src={avatar || default_avatar} style={{margin: '5px 10px'}}/>
                </Stack>

                <Popover
                    id={id}
                    open={open}
                    anchorEl={avatarEl}
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
                            <ListItemButton onClick={() => navigate('/profile')}>
                                <ListItemText primary="Profile"/>
                            </ListItemButton>
                        </ListItem>

                        <Divider />

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/friends')}>
                                <ListItemText primary="Friends" />
                            </ListItemButton>
                        </ListItem>

                        <Divider />

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/chat')}>
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
}

export default Navigation;