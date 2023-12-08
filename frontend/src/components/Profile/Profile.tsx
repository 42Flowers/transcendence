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
                setProfileInfos(data);
            }
        },
    });

    const [profileInfos, setProfileInfos] = useState(null);
    const [currentPopup, setCurrentPopup] = useState({
        'Newwww Avatar': false,
        'Newwww Pseudo': false,
        '3 total': false,
        '10 total': false,
        '100 total': false,
        'First Game': false,
        'You\'re getting used to Pong': false,
        'You\'re playing a lot': false,
        '3': false,
        '10': false,
        '100': false,
        'Small Leader': false,
        'Great Leader': false,
        'Perfect win': false,
        'You\'re a looser': false,
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

    const gamesWonFunc = ( userId: number, games: Game[] ): number => {
        let gamesWon = 0;
        games.map(game => {
            if (game.game.winnerId === userId) {
                gamesWon++;
            }
        });
        return gamesWon;
    };

    const gamesPerfectFunc = ( userId: number, games: Game[] ): string => {
        let gamePerfect = 0;
        let gameLooser = 0;
        games.map(game => {
            if (game.game.winnerId === userId && ((game.game.score1 === 10 && game.game.score2 === 0) || (game.game.score1 === 0 && game.game.score2 === 10))) {
                gamePerfect++;
            } else if (game.game.looserId === userId && ((game.game.score1 === 10 && game.game.score2 === 0) || (game.game.score1 === 0 && game.game.score2 === 10))) {
                gameLooser++;
            }
        })
        if (gamePerfect > 0) {
            return 'Perfect';
        } else if (gameLooser > 0) {
            return 'Looser';
        }
        return '';
    };

    const showPopup = ( popup: string ) => {
        setCurrentPopup(prevPopup => ({
            ...prevPopup,
            [popup]: true
        }));
        setPopupQueue(prevQueue => [...prevQueue, popup]);
    }

    const gamesWonInARowFunc = (userId: number, games: Game[]): number => {
        games.sort((a, b) => new Date(a.game.createdAt).getTime() - new Date(b.game.createdAt).getTime());

        let maxConsecutiveWins = 0;
        let currentConsecutiveWins = 0;

        games.forEach((game) => {
            if (userId === game.game.winnerId) {
                currentConsecutiveWins++;
                maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
            } else {
                currentConsecutiveWins = 0;
            }
        });

        return maxConsecutiveWins;
    };
     
  
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
            <div className="overlay" style={{ display: Object.values(currentPopup).some(a => a) ? 'block': 'none' }}></div>
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