import React, { useContext } from "react";
import { AvatarContext } from "../../contexts/AvatarContext";

import Stats from "../Stats/Stats";
import Achievements from "./Achievements/Achievements";
import ChangeAvatar from "./ChangeAvatar/ChangeAvatar";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import PseudoButton from "./PseudoButton/PseudoButton";
import Switch2FA from "./Switch2FA/Switch2FA";

import { useMutation, useQuery } from "react-query";
import { Achievement, PatchUserProfile, fetchAddAvatar, fetchProfile, patchUserProfile } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import './Profile.css';

import { AxiosError } from 'axios';
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
            if (data.avatar !== avatar) {
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

    if (userProfileQuery.isLoading) {
        return 'Loading...';
    }

    if (userProfileQuery.isError) {
        return 'Error';
    }


    const handleUploadAvatar = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        uploadAvatarMutation.mutate(formData);
    }

    const handleChangePseudo = (pseudo: string) => {
        patchProfileMutation.mutate({ pseudo });
    }

    const { pseudo } = userProfileQuery.data;

    return (
        <>
            <div className="Profile">
                <ChangeAvatar handleUploadAvatar={handleUploadAvatar} />
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