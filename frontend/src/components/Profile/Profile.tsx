import React, { useState, useEffect, useContext, useCallback } from "react";
import { AvatarContext } from "../../contexts/AvatarContext";
import { PseudoContext } from "../../contexts/PseudoContext";
import { LeaderContext } from "../../contexts/LeaderContext";
import async from 'async';

import Stats from "../Stats/Stats";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import Achievements from "./Achievements/Achievements";
import Switch2FA from "./Switch2FA/Switch2FA";
import PopUp from "../PopUp/PopUp";
import PseudoButton from "./PseudoButton/PseudoButton";
import ChangeAvatar from "./ChangeAvatar/ChangeAvatar";

import './Profile.css';
import { useAuthContext } from "../../contexts/AuthContext";
import { fetchAddAchievementToUser, fetchProfile, fetchAddAvatar, patchUserProfile, PatchUserProfile, Achievement } from "../../api";
import { useMutation, useQueries, useQuery } from "react-query";

import { AxiosError } from 'axios';
import { queryClient } from "../../query-client";

export interface AvatarContextType {
    avatar: string;
    setAvatar: (avatar: string) => void;
}

export interface PseudoContextType {
    pseudo: string
    setPseudo: (pseudo: string) => void;
}

export interface LeaderContextType {
    smallLeader: boolean
    setSmallLeader: (smallLeader: boolean) => void;
    greatLeader: boolean
    setGreatLeader: (greatLeader: boolean) => void;
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

type gamesParticipated = {
    winnerId: number
    looserId: number
    score1: number
    score2: number
    createdAt: Date
};

type Game = {
    game: gamesParticipated;
};

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
    // const { smallLeader, greatLeader } = useContext(LeaderContext) as LeaderContextType;
    //const { perfectWin, perfectLose } = useContext(PerfectContext) as PerfectContextType; // TODO: voir avec Max

    const patchProfileMutation = useMutation({
        mutationFn: (data: PatchUserProfile) => patchUserProfile('@me', data),
        onSuccess(data) {
            queryClient.setQueryData('profile', data);
        },
        onError(e: AxiosError) {
            alert("Min 3 characters and maximum 32 characters, Only a to z, A to Z, 0 to 9, and '-' are allowed or pseudo already in use");
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
            // if (!profileInfos?.avatar) {
            //     showPopup('Newwww Avatar');
            //     addAchievement({
            //         achievementId: profileInfos.achievements['Newwww Avatar'].id,
            //     });
            // }
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
        {/* IF current user */}
            <div className="Profile">
                <ChangeAvatar handleUploadAvatar={handleUploadAvatar} />
                <PseudoButton currentPseudo={pseudo} onChangePseudo={handleChangePseudo} />
                <div style={{ marginTop: '1em' }}>
                    <Switch2FA />
                </div>
        {/* ELSE */}
            {/* Add friend, block, unblock */}
        {/* ENDIF */}
                <Ladder auth={Number(auth.user?.id)} />
                <Stats userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
                <MatchHistory userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
                <Achievements userId={'@me'} />
            </div>
        </>
    )
}

export default Profile;