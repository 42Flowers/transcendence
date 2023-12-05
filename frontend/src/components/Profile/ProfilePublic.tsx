import React, { useState, useEffect, useContext, useCallback } from "react";
import Stats from "../Stats/Stats";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import Achievements from "./Achievements/Achievements";
import ChangeAvatar from "./ChangeAvatar/ChangeAvatar";
import { useAuthContext } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";

import './Profile.css';

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

interface Achievement {
    id: number;
    name: string;
    description: string;
    difficulty: number;
    isHidden: boolean;
    createdAt: Date;
 }
 
interface UserAchievement {
    userId: number;
    achievement: Achievement;
}

type Achievements = {
    achievements: Achievement[]
}

interface AchievementsListContextType {
    achievementsList: UserAchievement[];
    setAchievementsList: (achievementsList: UserAchievement[]) => void;
}

type gamesParticipated = {
    winnerId: number
    createdAt: Date
};
   
type Game = {
    game: gamesParticipated;
};

const ProfilePublic: React.FC = () => {
    const [profileInfos, setProfileInfos] = useState(null);
    const { userId } = useParams();
    const auth = useAuthContext();
 
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`http://localhost:3000/api/profile/${userId}`);
            const data = await response.json();
            setProfileInfos(prevState => {
                if (JSON.stringify(data) !== JSON.stringify(prevState)) {
                    return data;
                }
                return prevState;
            });
        };
        fetchData();
    }, []);

    return (
        <>
            <div className="Profile">
                {/* <ChangeAvatar handleUploadAvatar={handleUploadAvatar} /> */}
                <Ladder auth={Number(auth.user?.id)} />
                <Stats userId={Number(userId)} auth={Number(auth.user?.id)} />
                <MatchHistory userId={Number(userId)} auth={Number(auth.user?.id)} />
                <Achievements userId={Number(userId)} auth={Number(auth.user?.id)} />
            </div>
        </>
    )
}

export default ProfilePublic;