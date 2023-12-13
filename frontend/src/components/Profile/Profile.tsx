import React from "react";

import Stats from "../Stats/Stats";
import Achievements from "./Achievements/Achievements";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import PseudoButton from "./PseudoButton/PseudoButton";
import Switch2FA from "./Switch2FA/Switch2FA";

import AvatarEdit from 'react-avatar-edit';

import { useMutation, useQuery } from "react-query";
import { Achievement, PatchUserProfile, fetchUserProfile, patchUserProfile } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import './Profile.css';

import { Button } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { queryClient } from "../../query-client";
import { ChangeAvatar } from "./ChangeAvatar/ChangeAvatar";

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

    const userProfileQuery = useQuery('@me', () => fetchUserProfile('@me'));

    const patchProfileMutation = useMutation({
        mutationFn: (data: PatchUserProfile) => patchUserProfile('@me', data),
        onSuccess(data) {
            queryClient.setQueryData('@me', data);
        },
        onError() {
            alert("Min 3 characters and maximum 10 characters, Only a to z, A to Z, 0 to 9, and '-' are allowed or pseudo already in use");
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
            <div className="Profile" onError={e => alert(e)}>
                <ChangeAvatar onCrop={avatarPreview => setAvatarPreview(avatarPreview)} />

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
                <Stats userId={'@me'} />
                <MatchHistory userId={'@me'} />
                <Achievements userId={'@me'} />
            </div>
        </>
    )
}

export default Profile;