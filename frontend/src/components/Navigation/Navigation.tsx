import { Avatar, Divider, List, ListItem, ListItemButton, ListItemText, Popover, Stack } from "@mui/material";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import default_avatar from "../../assets/images/default_avatar.png";
import { AvatarContext } from "../../contexts/AvatarContext";
import { useAuthContext } from "../../contexts/AuthContext";
import './Navigation.css';

const Navigation: React.FC = () => {
    const avatarRef = React.useRef<HTMLDivElement>(null);
    const [ isOpen, setOpen ] = React.useState<boolean>(false);
    const { signOut } = useAuthContext();

    const { avatar } = useContext(AvatarContext);

    const handleAvatarClick = () => {
        setOpen(true);
    };

    const handleAvatarClose = () => {
        setOpen(false);
    };

    const id: string | undefined = isOpen ? "menu-popover" : undefined;

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" style={{ padding: '5px' }}>
                <Link to="/" className="logo">
                    PONG
                </Link>
                <div ref={avatarRef}>
                    <Avatar
                        aria-describedby={id}
                        alt="Avatar"
                        onClick={handleAvatarClick}
                        src={avatar || default_avatar}
                        style={{ margin: '5px 10px' }} />
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