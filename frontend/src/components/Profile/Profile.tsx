import React, { useContext } from "react";
import { AvatarContext } from "../../contexts/AvatarContext";

import Stats from "../Stats/Stats";
import Achievements from "./Achievements/Achievements";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import PseudoButton from "./PseudoButton/PseudoButton";
import Switch2FA from "./Switch2FA/Switch2FA";

import AvatarEdit from 'react-avatar-edit';

import { useMutation, useQuery } from "react-query";
import { Achievement, PatchUserProfile, fetchAddAvatar, fetchProfile, patchUserProfile } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import './Profile.css';

import { Button } from "@mui/material";
import { AxiosError } from 'axios';
import { enqueueSnackbar } from "notistack";
import { queryClient } from "../../query-client";

export interface AvatarContextType {
    avatar: string;
    setAvatar: (avatar: string) => void;
}

export interface PerfectContextType {
    perfectWin: boolean
    setPerfectWin: (perfectWin: boolean) => void;
    perfectLose: boolean
    setPerfectLose: (perfectLose: boolean) => void;
}

type Achievements = {
    achievements: Achievement[]
}

const Profile: React.FC = () => {
    const auth = useAuthContext();

    const userProfileQuery = useQuery('profile', fetchProfile, {
        onSuccess(data) {
            if (data.avatar !== null) {
                setAvatar(`http://localhost:3000/static/${data.avatar}`);
            }
        },
    });

    const { avatar, setAvatar } = useContext(AvatarContext) as AvatarContextType;

    const patchProfileMutation = useMutation({
        mutationFn: (data: PatchUserProfile) => patchUserProfile('@me', data),
        onSuccess(data) {
            queryClient.setQueryData('profile', data);
        },
        onError() {
            alert("Min 3 characters and maximum 10 characters, Only a to z, A to Z, 0 to 9, and '-' are allowed or pseudo already in use");
        }
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: fetchAddAvatar,
        onError(e: AxiosError) {
            if (e.response?.status === 422) {
                alert('Only jpg, jpeg, png file. Maximum dimension 1000x1000. Maximum size 1000042 bytes');
            } else {
                alert(e.message);
            }
        },
        onSuccess(data) {
            setAvatar(`http://localhost:3000/static/${data.avatar}`)
        }
    });

    const handleUploadAvatar = async () => {
        if (!avatarPreview) {
            enqueueSnackbar({
                message: 'Avatar not set',
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
            return ;
        }

        try {
            const r = await fetch(avatarPreview);
            const b = await r.blob();

            patchProfileMutation.mutate({
                avatar: new File([ b ], 'avatar.png', {
                    type: 'image/png',
                }),
            })
        } catch {
            ;
        }
    }

    const handleChangePseudo = (pseudo: string) => {
        patchProfileMutation.mutate({ pseudo });
    }

    const onBeforeFileLoad = (elem: React.ChangeEvent<HTMLInputElement>) => {
        if (elem.target.files) {
            if(elem.target.files[0].size > 1048576){
                alert("File is too big!");
                elem.target.value = '';
            };
        }
    };

    const [ avatarPreview, setAvatarPreview ] = React.useState<string>();

    if (userProfileQuery.isLoading) {
        return 'Loading...';
    }

    if (userProfileQuery.isError) {
        return 'Error';
    }

    const pseudo = userProfileQuery.data?.pseudo ?? '';

    return (
        <>
            <div className="Profile">
                <AvatarEdit
                    width={300}
                    height={300}
                    exportMimeType="image/png"
                    exportSize={512}
                    onBeforeFileLoad={onBeforeFileLoad}
                    onCrop={avatarPreview => setAvatarPreview(avatarPreview)} />

                &nbsp;
                
                <Button variant="contained" onClick={handleUploadAvatar}>
                    Change avatar
                </Button>
                {/* <ChangeAvatar handleUploadAvatar={handleUploadAvatar} /> */}
                <PseudoButton currentPseudo={pseudo} onChangePseudo={handleChangePseudo} />
                <div style={{ marginTop: '1em' }}>
                    <Switch2FA />
                </div>
                <Ladder />
                <Stats userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
                <MatchHistory userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
                <Achievements userId={'@me'} />
            </div>
        </>
    )
}

export default Profile;