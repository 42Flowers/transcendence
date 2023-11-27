import { useContext } from "react";
import { AvatarContext } from "../../../contexts/AvatarContext";
import { AvatarContextType } from "../Profile";
import { Avatar, Button } from "@mui/material";
import default_avatar from "../../../assets/images/default_avatar.png";

type ChangeAvatarProps = {
    handleUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ handleUploadAvatar }) => {
    const { avatar } = useContext(AvatarContext) as AvatarContextType;

    return (
        <>
            <Avatar
                alt="Avatar"
                src={avatar || default_avatar}
                sx={{
                    width: '6vh',
                    height: '6vh'
                }}
            />
            <Button
                variant="text"
                sx={{ 
                    fontSize: '1em', 
                    marginTop: '1.5vh',
                    fontWeight: '900',
                    color: "#F8A38B",
                }}
                onClick={() => (document.getElementById('fileInput') as HTMLElement).click()}
            >
                CHANGE AVATAR 
            </Button>
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleUploadAvatar}
            />
        </>
    )
};

export default ChangeAvatar;