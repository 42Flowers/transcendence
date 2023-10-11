import React, { MouseEvent } from "react";
import { Avatar, Stack, Popover, List, ListItem, ListItemButton, ListItemText, Divider } from "@mui/material";
import default_avatar from "../../assets/images/default_avatar.png";
import './Navigation.css';

interface Props {
    onRouteChange: (route: string) => void;
    isSignedIn: boolean;
}

const Navigation: React.FC<Props> = ({ onRouteChange, isSignedIn }) => {
    const [avatarEl, setAvatarEl] = React.useState<HTMLDivElement | null>(null);

    const handleAvatarClick = (e: MouseEvent<HTMLDivElement>) => {
        setAvatarEl(e.currentTarget);
    };

    const handleAvatarClose = () => {
        setAvatarEl(null);
    };

    const open = Boolean(avatarEl);
    const id: string | undefined = open ? "menu-popover" : undefined;
    /* if user is not signed in, no navigation*/
    if (!isSignedIn) {
        return (null);
    } else {
        return (
            <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" style={{padding: '5px'}}>
                    <p onClick={() => onRouteChange('pong')} className="logo">
                        PONG
                    </p>
                    <Avatar aria-describedby={id} alt="Avatar" onClick={handleAvatarClick} src={default_avatar} style={{margin: '5px 10px'}}/>
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
                            <ListItemButton onClick={() => onRouteChange('profile')}>
                                <ListItemText primary="Profile"/>
                            </ListItemButton>
                        </ListItem>

                        <Divider />

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => onRouteChange('signin')}>
                                <ListItemText primary="Friends (tempo login)" />
                            </ListItemButton>
                        </ListItem>

                        <Divider />

                        <ListItem disablePadding>
                            <ListItemButton onClick={() => onRouteChange('chat')}>
                                <ListItemText primary="Chat" />
                            </ListItemButton>
                        </ListItem>
                        
                    </List>
                </Popover>
            </>
        );
    }
}

export default Navigation;